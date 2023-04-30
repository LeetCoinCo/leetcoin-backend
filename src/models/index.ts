type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type Language = 'substrate_rust';

type CodeMap = Record<Language, string>;

export interface User {
  id: string;
  address: string;
  username: string;
  email: string;
  password: string;
}

export interface CodeMetadata {
  starterCode: CodeMap,
  codeSolution: CodeMap,
}

export interface Question {
  uniqueName: string, // auto generated based on title
  id: string,
  title: string,
  description: string,
  difficulty: QuestionDifficulty,
  frequency: number,
  rating: number,
  codeMetadata: CodeMetadata,
}

export interface Case {
  id: string,
  rawOutput: string,
  runtime: number,
  display: boolean,
}

type CaseMap = Record<string, Case>;

export interface QuestionSubmissionResult {
  cases: CaseMap,
}

export type QuestionSubmissionStatus = 'initial' | 'failed_to_compile' | 'failed_tests' | 'pending' | 'success' | 'system_error';

export interface QuestionSubmission {
  id: string,
  questionId: string,
  userId: string,
  submissionCode: string,
  language: Language,
  results: QuestionSubmissionResult,
  status: QuestionSubmissionStatus,
}

export enum RunnerStatus {
  SUCCESS = 0,
  FAILED_TO_COMPILE = 1,
  FAILED_TESTS = 2,
  SYSTEM_ERROR = 3,
  NO_OP = 4,
}


export interface RunnerOutput {
  rawOutput: string,
  status: RunnerStatus,
}
