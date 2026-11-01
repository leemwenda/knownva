import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many attempts, please try again later" },
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests, please try again later" },
});

export const authRouter = Router();

authRouter.post("/register", authLimiter, authController.register);
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/verify-email", authLimiter, authController.verifyEmail);
authRouter.post("/resend-verification", passwordLimiter, authController.resendVerification);
authRouter.post("/forgot-password", passwordLimiter, authController.forgotPassword);
authRouter.post("/reset-password", passwordLimiter, authController.resetPassword);
authRouter.post("/change-password", authenticate, authController.changePassword);
