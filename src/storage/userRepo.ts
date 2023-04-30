import { PsqlDB } from "./db";
import { QueryResultRow } from "pg";
import { User } from "../models";


export class UserRepo {
  private static instance: UserRepo;
  private readonly db: PsqlDB;

  private constructor() {
    this.db = PsqlDB.getInstance();
  }

  public static getInstance(): UserRepo {
    if (!UserRepo.instance) {
      UserRepo.instance = new UserRepo();
    }

    return UserRepo.instance;
  }

  public async getUserByAddress(address: string): Promise<User> {
    const query = `SELECT * FROM users WHERE address = $1`;
    const res = await this.db.execute(query, [address]);
    if (res.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = res.rows[0];
    return mapRecordToUser(user);
  }

  public async updateUser(user: User): Promise<User> {
    const query = `UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING *`;
    const res = await this.db.execute(query, [user.username, user.password, user.id]);
    if (res.rows.length === 0) {
      throw new Error('Failed to update user');
    }
    const updatedUser = res.rows[0];
    return mapRecordToUser(updatedUser);
  }

  public async createUser(user: User): Promise<User> {
    const query = `INSERT INTO users (id, address, username, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    const res = await this.db.execute(query, [user.id, user.address, user.username, user.password]);
    if (res.rows.length === 0) {
      throw new Error('Failed to create user');
    }
    const createdUser = res.rows[0];
    return mapRecordToUser(createdUser);
  }
}

function mapRecordToUser(record: QueryResultRow): User {
  try {
    const userId = record['id'];
    const address = record['address'];
    const email = record['email'];
    const password = record['password'];
    const username = record['username'];
    return {
      id: userId,
      address,
      email,
      password,
      username
    };
  } catch (error) {
    throw new Error(`Error mapping record to user: ${error}`);
  }
}
