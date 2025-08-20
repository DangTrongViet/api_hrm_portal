import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import body_parser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http";
import "dotenv/config";

import { connectDatabase } from "@models/connect";
import { seed } from "./seed"; // sửa lại path nếu cần
import { errorMiddleware } from "@middleware";
import route from "@router";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// --- Middleware cơ bản
app.use(express.json());
app.use(body_parser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// --- Route test
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Node.js với TypeScript!");
});

// --- Middleware lỗi chung
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

// --- Hàm khởi động server
const startServer = async () => {
  try {
    // Kết nối database
    await connectDatabase();

    // Chỉ chạy seed khi ở môi trường development
    if (process.env.NODE_ENV === "development") {
      await seed();
    }

    // Mount router
    route(app);

    // Lắng nghe port
    server.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// --- Start server
startServer();
