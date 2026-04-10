import { RequestHandler } from "express";

const allFoldersPageGet: RequestHandler = async (_req, res) => {
  res.render("folders");
};

const FolderController = {
  allFoldersPageGet,
};

export default FolderController;
