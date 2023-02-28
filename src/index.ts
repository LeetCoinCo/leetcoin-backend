import express from 'express';
import router from './routes';
import dotenv from 'dotenv';

dotenv.config(); // loads environment variables from .env file

const app = express();
const port = 8080; // default port to listen

app.use(express.json())

app.use('/api', router);

app.get("/", (req, res) => {
  res.send('Hello World!');
});

app.use('/debug', (req, res) => {
  res.send('Hello world!');
});

app.listen(port, async () => {
  console.log(`Server started at http://localhost:${port}`);
});
