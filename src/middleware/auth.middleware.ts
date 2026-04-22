import { RequestHandler } from "express";

const isAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).render("errorpage", { prompt: "Not Permitted" });
  }
};

export { isAuth };
