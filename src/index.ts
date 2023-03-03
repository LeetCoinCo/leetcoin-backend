import express from 'express';
import router from './routes';
import dotenv from 'dotenv';
import {PsqlDB} from "./storage/db";

dotenv.config(); // loads environment variables from .env file

const app = express();
const port = 8080; // default port to listen

async function initDB() {
  const db = PsqlDB.getInstance();
  const client = await db.getClient();
  try {
    await client.query('SELECT NOW()');
  } catch (err) {
    console.log(`failed to initialize db: ${err}`);
    throw err;
  }
}

app.use(express.json())

app.use('/api', router);


app.use('/debug', (req, res) => {
  res.send('Hello world!');
});

app.listen(port, async () => {
  await initDB();
  console.log(`Server started at http://localhost:${port}`);
});
