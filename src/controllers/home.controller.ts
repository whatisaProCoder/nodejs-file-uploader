import { RequestHandler } from "express";

const homePageGet: RequestHandler = (_req, res) => {
  res.render("landing");
};

const HomeController = {
  homePageGet,
};

export default HomeController;
