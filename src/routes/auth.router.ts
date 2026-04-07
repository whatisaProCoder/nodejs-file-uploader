import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/sign-up", AuthController.signUpPageGet);

authRouter.get("/log-in", AuthController.loginPageGet);

export default authRouter;
