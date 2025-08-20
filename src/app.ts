import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import body_parser from 'body-parser';
import { connectDatabase } from '@models/connect';
import { errorMiddleware } from '@middleware';
import route from '@router';
import http from 'http';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// --- Middleware cơ bản
app.use(express.json());
app.use(body_parser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
// Route test
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Node.js với TypeScript!');
});

// --- Kết nối DB
connectDatabase();

// --- Middleware lỗi chung
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

route(app);

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
