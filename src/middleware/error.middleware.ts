import { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(`Error: ${err.message}`);
};

export default errorMiddleware;
