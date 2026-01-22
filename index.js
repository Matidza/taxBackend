import express from "express";

import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import mongoose from "mongoose";
import logger from "./src/config/logger.js";
import connectDB from "./src/mongoDB/connect.js";
import UserModel from "./src/models/userModel.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import boardRoutes from "./src/routes/onBoardingRoute.js";
import dashboardRoute from "./src/routes/dashboardRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// ✅ Log incomming request
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use( express.json({ limit: "900mb" }));
app.use( morgan("combined", { stream: { write: (message) => logger.info(message.trim()) }, }));


/** Middleware to handle CORS */
const allowedOrigins = process.env.FRONTEND_URL_ALLOWED || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// test Route
app.get("/", async (request, response) => {
  const users = await UserModel.find();
  const result = users;
  return response.status(200).json({
    success: true,
    result: result,
  });
});

// Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/onboarding", boardRoutes);
app.use("/dashboard", dashboardRoute);

const mongoURI = process.env.MONGO_URI || "*";
const startServer = async () => {
  try {
    await mongoose.connect(mongoURI);

    // connectDB(process.env.MONGODB_URI)
    console.log(`\n`);
    logger.info("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`, `\n`);
      // console.log(`🚀 Server running on http://localhost:${PORT}`,`\n`);
    });
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
// | Level     | Meaning        | Used For                                   |
// | --------- | -------------- | ------------------------------------------ |
// | `error`   | Most severe    | Crashes, failed DB connections, exceptions |
// | `warn`    | Warnings       | Deprecations, potential issues             |
// | `info`    | General info   | Server start, successful requests          |
// | `http`    | Request info   | (Optional) API calls, HTTP events          |
// | `verbose` | Detailed info  | Step-by-step actions                       |
// | `debug`   | Developer logs | Troubleshooting and local debugging        |
// | `silly`   | Least severe   | Extra noise for deep inspection            |

startServer();
