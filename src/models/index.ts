export enum QuestionDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 3,
}

export enum Language {
  SUBSTRATE_RUST = 0,
}

type CodeMap = Record<Language, string>;

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
  difference: string,
  runtime: number,
  display: boolean,
}

type CaseMap = Record<string, Case>;

export interface QuestionSubmissionResult {
  cases: CaseMap,
}

export enum QuestionSubmissionStatus {
  FailedToCompile = 0,
  FailedTests = 1,
  Pending = 2,
  Success = 3,
}

export interface QuestionSubmission {
  id: string,
  questionId: string,
  userId: string,
  submissionURL: string,
  language: Language,
  results: QuestionSubmissionResult,
  status: QuestionSubmissionStatus,
}
