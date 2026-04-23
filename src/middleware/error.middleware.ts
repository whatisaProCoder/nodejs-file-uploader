import { ErrorRequestHandler } from "express";
import AppError from "../errors/app.error";

const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  console.log(err);
  if (err instanceof AppError) {
    return res.status(err.status).render("errorpage", { prompt: err.message });
  } else {
    res
      .status(err.statusCode || 500)
      .render("errorpage", { prompt: `Error: ${err.message}` });
  }
};

export default errorMiddleware;
