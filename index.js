import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { startKeepAliveScheduler } from "./services/keepAlive.scheduler.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDb();
    startKeepAliveScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
