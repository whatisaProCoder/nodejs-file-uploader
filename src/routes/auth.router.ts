import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import userValidator from "../validators/user.validator";

const authRouter = Router();

authRouter.get("/sign-up", AuthController.signUpPageGet);

authRouter.post(
  "/sign-up",
  userValidator.signUpRules,
  AuthController.signUpPagePost,
);

authRouter.get("/log-in", AuthController.loginPageGet);

authRouter.post("/log-in", AuthController.loginPagePost);

authRouter.get("/log-out", AuthController.logOutGet);

export default authRouter;
