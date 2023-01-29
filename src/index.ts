import 'module-alias/register';
import express from 'express';
import router from './routes';

const app = express();
const port = 8080; // default port to listen

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
