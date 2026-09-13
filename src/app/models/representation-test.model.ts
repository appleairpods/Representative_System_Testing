export type RepresentationalSystem = 'V' | 'A' | 'K' | 'Ad';

export interface TestOption {
  text: string;
  system: RepresentationalSystem;
}

export interface TestQuestion {
  id: number;
  prompt: string;
  options: TestOption[];
}

export interface QuestionAnswers {
  questionId: number;
  ranks: Record<RepresentationalSystem, number | null>;
}

export interface TestResults {
  answers: QuestionAnswers[];
  systemTotals: Record<RepresentationalSystem, number>;
  completedAt: string;
}
