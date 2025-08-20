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

// 🟢 BẮT BUỘC trên Render/Heroku → cookie secure hoạt động
app.set("trust proxy", 1);

// --- Middleware cơ bản
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CORS
const FE_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";
const corsOptions: cors.CorsOptions = {
  origin: FE_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

// Route test
app.get("/", (_req: Request, res: Response) => res.send("OK"));

// --- Kết nối DB
connectDatabase();

// --- Routes
route(app);

// --- Middleware lỗi cuối cùng
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
