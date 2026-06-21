import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  deleteRenderUrl,
  getAllRenderUrls,
  registerRenderUrl,
} from "../controllers/user.controller.js";

const userRouter = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
    error: {
      renderUrl: "Rate limit exceeded for URL registration.",
    },
  },
});

userRouter.post("/register", registerLimiter, registerRenderUrl);
userRouter.get("/", getAllRenderUrls);
userRouter.delete("/:id", deleteRenderUrl);

export default userRouter;
