import { RequestHandler } from "express";

const isAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("Not Permitted");
  }
};

export { isAuth };
