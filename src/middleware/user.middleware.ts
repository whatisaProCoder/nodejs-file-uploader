import { RequestHandler } from "express";

const userMiddleware: RequestHandler = (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
};

export default userMiddleware;
