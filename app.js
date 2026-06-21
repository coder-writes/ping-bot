import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/health", (req, res) => {
  console.log(
    `[HEALTH] hit method=${req.method} path=${req.originalUrl} ip=${req.ip} at=${new Date().toISOString()}`,
  );
  res.status(200).json({
    success: true,
    message: "Server is running",
    error: null,
  });
});

app.use("/api/urls", userRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This Render URL is already registered.",
      error: {
        renderUrl: "This Render URL is already registered.",
      },
    });
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode >= 500 ? "Internal server error" : error.message || "Request failed";

  return res.status(statusCode).json({
    success: false,
    message,
    error: error.details || error.message || "Unexpected error",
  });
});

export default app;
