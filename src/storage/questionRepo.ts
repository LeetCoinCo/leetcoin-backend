import { PsqlDB } from "./db";
import { QueryResultRow } from "pg";
import {Question, QuestionSubmission} from "../models";


export class QuestionRepo {
  private static instance: QuestionRepo;
  private readonly db: PsqlDB;

  private constructor() {
    this.db = PsqlDB.getInstance();
  }

  public static getInstance(): QuestionRepo {
    if (!QuestionRepo.instance) {
      QuestionRepo.instance = new QuestionRepo();
    }

    return QuestionRepo.instance;
  }

  public async getQuestion(questionID: string): Promise<Question> {
    const query = `SELECT * FROM questions WHERE id = $1`;
    const res = await this.db.execute(query, [questionID]);
    if (res.rows.length === 0) {
      throw new Error('Question not found');
    }
    const question = res.rows[0];
    return mapRecordToQuestion(question);
  }

  public async getQuestions(): Promise<Question[]> {
    const query = `SELECT * FROM questions`;
    const res = await this.db.execute(query, []);
    console.log(res);
    if (res.rows.length === 0) {
      return [];
    }
    return res.rows.map(mapRecordToQuestion);
  }
}

function mapRecordToQuestion(record: QueryResultRow): Question {
  try {
    const questionId = record['id'];
    const name = record['name'];
    const description = record['description'];
    const title = record['title'];
    const difficulty = record['difficulty'];
    const frequency = record['frequency'];
    const rating = record['rating'];
    const metadata = record['metadata'];
    return {
      uniqueName: name,
      id: questionId,
      title,
      description,
      difficulty,
      frequency,
      rating,
      codeMetadata: metadata,
    };
  } catch (error) {
    throw new Error(`Error mapping record to question: ${error}`);
  }
}
