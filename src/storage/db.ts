import {Client, QueryResult} from 'pg';

export class PsqlDB {
  private static instance: PsqlDB;
  private readonly client: Client;
  private connected: boolean;

  private constructor() {
    this.client = new Client();
    this.connected = false;
  }

  public static getInstance(): PsqlDB {
    if (!PsqlDB.instance) {
      PsqlDB.instance = new PsqlDB();
    }

    return PsqlDB.instance;
  }

  public async getClient() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
    return this.client;
  }

  public async execute(query: string, values: string[]): Promise<QueryResult> {
    if (query.length === 0) {
      throw new Error('query can not be empty');
    }
    return await this.client.query(query, values);
  }
}
