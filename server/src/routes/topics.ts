import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { TopicRow } from "../types";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  technologyId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { technologyId, name } = parsed.data;

  // Ownership check: the technology must belong to this user
  const owns = await pool.query(
    "select id from technologies where id = $1 and user_id = $2",
    [technologyId, req.userId]
  );
  if (owns.rowCount === 0) return res.status(404).json({ error: "Technology not found" });

  const countResult = await pool.query(
    "select count(*)::int as count from topics where technology_id = $1",
    [technologyId]
  );
  const position = countResult.rows[0].count;

  const result = await pool.query<TopicRow>(
    "insert into topics (technology_id, name, position) values ($1, $2, $3) returning *",
    [technologyId, name, position]
  );
  const topic = result.rows[0];
  res.status(201).json({ id: topic.id, name: topic.name, position: topic.position });
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  // Ownership check via join to technologies, then delete
  const result = await pool.query(
    `delete from topics
     using technologies
     where topics.id = $1
       and topics.technology_id = technologies.id
       and technologies.user_id = $2
     returning topics.id`,
    [req.params.id, req.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Topic not found" });
  res.status(204).send();
});

export default router;
