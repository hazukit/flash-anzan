export interface User {
  id: string;
  name: string;
  settings: DifficultySettings;
  createdAt: number;
}

export interface DifficultySettings {
  operations: OperationType[];
  maxDigits: number;
  playTime: number;
}

export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface GameSession {
  id: string;
  userId: string;
  date: number;
  correctAnswers: number;
  totalProblems: number;
  settings: DifficultySettings;
}

export interface Problem {
  numbers: number[];
  operation: OperationType;
  correctAnswer: number;
}

export interface GameResult {
  correctAnswers: number;
  totalProblems: number;
  timeSpent: number;
}

export interface WeeklyRanking {
  userId: string;
  userName: string;
  totalCorrectAnswers: number;
}

export interface DailyBestScore {
  userId: string;
  date: string; // YYYY-MM-DD format
  bestScore: number;
  sessionId: string;
}