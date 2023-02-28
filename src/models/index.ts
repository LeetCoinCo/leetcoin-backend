export enum QuestionDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 3,
}

export enum Language {
  SUBSTRATE_RUST = 0,
  SOLIDITY = 1,
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
  Initial = 0,
  FailedToCompile = 1,
  FailedTests = 2,
  Pending = 3,
  Success = 4,
  SystemError = 5,
}

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
