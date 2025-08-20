import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDatabase } from "@models/connect";
import { errorMiddleware } from "@middleware";
import route from "@router";
import http from "http";
import "dotenv/config";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// ✅ BẮT BUỘC khi chạy sau proxy (Render/Heroku) để cookie Secure hoạt động
app.set("trust proxy", 1);

// --- Body + Cookie
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CORS (hỗ trợ nhiều origin, cho credentials)
const FE_ORIGINS = (process.env.APP_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    // Cho phép request không có Origin (Postman) và các FE hợp lệ
    if (!origin || FE_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// Route test
app.get("/", (_req: Request, res: Response) => res.send("OK"));

// --- DB
connectDatabase();

// --- Routes (đảm bảo các route /api/* được mount trong route(app))
route(app);

// --- Error handler cuối
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
