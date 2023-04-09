import {PsqlDB} from "./db";
import {QueryResultRow} from "pg";
import {QuestionSubmission, QuestionSubmissionStatus, RunnerStatus} from "../models";
import * as RunnerManager from '../engine/runnerManager';
import {QuestionRepo} from "./questionRepo";


export class QuestionSubmissionRepo {
  private static instance: QuestionSubmissionRepo;
  private readonly db: PsqlDB;

  private constructor() {
    this.db = PsqlDB.getInstance();
  }

  public static getInstance(): QuestionSubmissionRepo {
    if (!QuestionSubmissionRepo.instance) {
      QuestionSubmissionRepo.instance = new QuestionSubmissionRepo();
    }

    return QuestionSubmissionRepo.instance;
  }

  public async getSubmission(submissionID: string): Promise<QuestionSubmission> {
    const query = `SELECT * FROM question_submissions WHERE id = $1`;
    const res = await this.db.execute(query, [submissionID]);
    if (res.rows.length === 0) {
      throw new Error('Submission not found');
    }
    const submission = res.rows[0];
    return mapRecordToQuestionSubmission(submission);
  }

  public async getQuestionSubmissions(questionID: string): Promise<QuestionSubmission[]> {
    const query = `SELECT * FROM question_submissions WHERE question_id = $1`;
    const res = await this.db.execute(query, [questionID]);
    if (res.rows.length === 0) {
      return [];
    }
    return res.rows.map(mapRecordToQuestionSubmission);
  }

  public async createQuestionSubmission(submission: QuestionSubmission): Promise<QuestionSubmission> {
    const query = `INSERT INTO question_submissions (user_id, question_id, submission, language, status, results) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const res = await this.db.execute(query, [submission.userId, submission.questionId, submission.submissionCode, submission.language.toString(), 'initial', JSON.stringify(submission.results)]);
    if (res.rows.length === 0) {
      throw new Error('Failed to create question submission');
    }
    const createdSubmission = res.rows[0];
    return mapRecordToQuestionSubmission(createdSubmission);
  }

  public async updateQuestionSubmission(submission: QuestionSubmission): Promise<QuestionSubmission> {
    const query = `UPDATE question_submissions SET submission = $1, language = $2, status = $3, results = $4 WHERE id = $5 RETURNING *`;
    const res = await this.db.execute(query, [submission.submissionCode, submission.language.toString(), submission.status.toString(), JSON.stringify(submission.results), submission.id]);
    if (res.rows.length === 0) {
      throw new Error('Failed to update question submission');
    }
    const updatedSubmission = res.rows[0];
    return mapRecordToQuestionSubmission(updatedSubmission);
  }

  public async runLatestQuestionSubmission(submission: QuestionSubmission): Promise<QuestionSubmission> {
    const query = `SELECT * FROM question_submissions WHERE question_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1`;
    const res = await this.db.execute(query, [submission.questionId, submission.userId]);
    const questionRepo = QuestionRepo.getInstance();
    let question = null;
    question = await questionRepo.getQuestion(submission.questionId);
    if (res.rows.length === 0) {
      submission = await this.createQuestionSubmission(submission);
    } else {
      submission = await this.updateQuestionSubmission(submission);
    }
    submission.status = await run(submission, question.codeMetadata.codeSolution[submission.language]);
    submission = await this.updateQuestionSubmission(submission);
    return submission;
  }

}

async function run(questionSubmission: QuestionSubmission, codeSolution: string): Promise<QuestionSubmissionStatus> {
  const {status, rawOutput} = await RunnerManager.run(questionSubmission.id, questionSubmission.questionId, questionSubmission.language, codeSolution);
  if (status === RunnerStatus.SUCCESS) {
    return 'success';
  } else if (status === RunnerStatus.FAILED_TESTS) {
    return 'failed_tests';
  } else if (status === RunnerStatus.FAILED_TO_COMPILE) {
    return 'failed_to_compile';
  } else {
    return 'system_error';
  }
}

function mapRecordToQuestionSubmission(record: QueryResultRow): QuestionSubmission {
  try {
    const id = record['id'];
    const userId = record['user_id'];
    const questionId = record['question_id'];
    const submissionURL = record['submission'];
    const language = record['language'];
    const status = record['status'];
    const results = record['results'];
    return {
      id,
      userId,
      questionId,
      submissionCode: submissionURL,
      language,
      status,
      results,
    };
  } catch (error) {
    throw new Error(`Error mapping record to question: ${error}`);
  }
}
