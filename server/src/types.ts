// Shapes returned to the client (camelCase) — mirrors client/src/types/index.ts

export interface QuestionDTO {
  id: string;
  question: string;
  deepAnswer: string;
  shortAnswer: string;
  position: number;
}

export interface TopicDTO {
  id: string;
  name: string;
  position: number;
  questions: QuestionDTO[];
}

export interface TechnologyDTO {
  id: string;
  name: string;
  position: number;
  topics: TopicDTO[];
}

// Raw row shapes coming back from `pg` (snake_case, matching schema.sql)

export interface QuestionRow {
  id: string;
  topic_id: string;
  question: string;
  deep_answer: string;
  short_answer: string;
  position: number;
}

export interface TopicRow {
  id: string;
  technology_id: string;
  name: string;
  position: number;
}

export interface TechnologyRow {
  id: string;
  user_id: string;
  name: string;
  position: number;
}

export function toQuestionDTO(row: QuestionRow): QuestionDTO {
  return {
    id: row.id,
    question: row.question,
    deepAnswer: row.deep_answer,
    shortAnswer: row.short_answer,
    position: row.position,
  };
}
