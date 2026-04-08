import { RequestHandler } from "express";

const dashboardPageGet: RequestHandler = async (_req, res) => {
  res.render("dashboard");
};

const DashboardController = {
  dashboardPageGet,
};

export default DashboardController;
