import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { toQuestionDTO, TechnologyDTO, TechnologyRow, TopicRow, QuestionRow } from "../types";

const router = Router();
router.use(requireAuth);

// GET /api/technologies — full nested tree for the logged-in user,
// assembled in JS from three flat queries (simple and fast at this scale;
// swap for a single JSON-aggregating query later if the dataset grows large).
router.get("/", async (req: AuthedRequest, res) => {
  const techResult = await pool.query<TechnologyRow>(
    "select * from technologies where user_id = $1 order by position asc",
    [req.userId]
  );
  const technologies = techResult.rows;
  const techIds = technologies.map((t) => t.id);

  const topicResult = techIds.length
    ? await pool.query<TopicRow>(
        "select * from topics where technology_id = any($1::uuid[]) order by position asc",
        [techIds]
      )
    : { rows: [] as TopicRow[] };
  const topics = topicResult.rows;
  const topicIds = topics.map((t) => t.id);

  const questionResult = topicIds.length
    ? await pool.query<QuestionRow>(
        "select * from questions where topic_id = any($1::uuid[]) order by position asc",
        [topicIds]
      )
    : { rows: [] as QuestionRow[] };
  const questions = questionResult.rows;

  const tree: TechnologyDTO[] = technologies.map((tech) => ({
    id: tech.id,
    name: tech.name,
    position: tech.position,
    topics: topics
      .filter((topic) => topic.technology_id === tech.id)
      .map((topic) => ({
        id: topic.id,
        name: topic.name,
        position: topic.position,
        questions: questions.filter((q) => q.topic_id === topic.id).map(toQuestionDTO),
      })),
  }));

  res.json(tree);
});

const nameSchema = z.object({ name: z.string().min(1, "Name is required") });

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = nameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const countResult = await pool.query(
    "select count(*)::int as count from technologies where user_id = $1",
    [req.userId]
  );
  const position = countResult.rows[0].count;

  const result = await pool.query<TechnologyRow>(
    "insert into technologies (user_id, name, position) values ($1, $2, $3) returning *",
    [req.userId, parsed.data.name, position]
  );
  const tech = result.rows[0];
  res.status(201).json({ id: tech.id, name: tech.name, position: tech.position });
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const result = await pool.query(
    "delete from technologies where id = $1 and user_id = $2 returning id",
    [req.params.id, req.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Technology not found" });
  res.status(204).send();
});

export default router;
