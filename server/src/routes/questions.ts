import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { toQuestionDTO, QuestionRow } from "../types";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  topicId: z.string().uuid(),
  question: z.string().default(""),
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { topicId, question } = parsed.data;

  // Ownership check via join: topic -> technology -> user
  const owns = await pool.query(
    `select topics.id from topics
     join technologies on technologies.id = topics.technology_id
     where topics.id = $1 and technologies.user_id = $2`,
    [topicId, req.userId]
  );
  if (owns.rowCount === 0) return res.status(404).json({ error: "Topic not found" });

  const countResult = await pool.query(
    "select count(*)::int as count from questions where topic_id = $1",
    [topicId]
  );
  const position = countResult.rows[0].count;

  const result = await pool.query<QuestionRow>(
    "insert into questions (topic_id, question, position) values ($1, $2, $3) returning *",
    [topicId, question, position]
  );
  res.status(201).json(toQuestionDTO(result.rows[0]));
});

const updateSchema = z.object({
  question: z.string().optional(),
  deepAnswer: z.string().optional(),
  shortAnswer: z.string().optional(),
  position: z.number().int().optional(),
});

// Maps camelCase API fields to snake_case columns, only including what was sent
const COLUMN_MAP: Record<string, string> = {
  question: "question",
  deepAnswer: "deep_answer",
  shortAnswer: "short_answer",
  position: "position",
};

router.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const fields = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  // Ownership check via join: question -> topic -> technology -> user
  const owns = await pool.query(
    `select questions.id from questions
     join topics on topics.id = questions.topic_id
     join technologies on technologies.id = topics.technology_id
     where questions.id = $1 and technologies.user_id = $2`,
    [req.params.id, req.userId]
  );
  if (owns.rowCount === 0) return res.status(404).json({ error: "Question not found" });

  const setClauses = fields.map(([key], i) => `${COLUMN_MAP[key]} = $${i + 1}`);
  const values = fields.map(([, v]) => v);

  const result = await pool.query<QuestionRow>(
    `update questions set ${setClauses.join(", ")} where id = $${fields.length + 1} returning *`,
    [...values, req.params.id]
  );
  res.json(toQuestionDTO(result.rows[0]));
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `delete from questions
     using topics, technologies
     where questions.id = $1
       and questions.topic_id = topics.id
       and topics.technology_id = technologies.id
       and technologies.user_id = $2
     returning questions.id`,
    [req.params.id, req.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Question not found" });
  res.status(204).send();
});

export default router;
