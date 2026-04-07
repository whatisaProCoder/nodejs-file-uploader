import { RequestHandler } from "express";

const signUpPageGet: RequestHandler = (req, res) => {
  res.render("sign-up", { oldData: {} });
};

const AuthController = {
  signUpPageGet,
};

export default AuthController;
