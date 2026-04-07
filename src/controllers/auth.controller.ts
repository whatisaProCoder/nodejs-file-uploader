import { RequestHandler } from "express";

const signUpPageGet: RequestHandler = (_req, res) => {
  res.render("sign-up", { oldData: {} });
};

const loginPageGet: RequestHandler = (_req, res) => {
  res.render("log-in", { oldData: {} });
};

const AuthController = {
  signUpPageGet,
  loginPageGet,
};

export default AuthController;
