export interface Question {
  id: string;
  question: string;
  deepAnswer: string;
  shortAnswer: string;
  position: number;
}

export interface Topic {
  id: string;
  name: string;
  position: number;
  questions: Question[];
}

export interface Technology {
  id: string;
  name: string;
  position: number;
  topics: Topic[];
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
