import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import routes from './routes';
import { HttpError } from './utils/errors';
import { initSockets } from './sockets/status';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const server = http.createServer(app);
initSockets(server);

server.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});


