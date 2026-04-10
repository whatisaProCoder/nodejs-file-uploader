import { Router } from "express";
import FolderController from "../controllers/folder.controller";
import folderValidator from "../validators/folderValidator";

const folderRouter = Router();

folderRouter.get("/all", FolderController.allFoldersPageGet);

folderRouter.post(
  "/new",
  folderValidator.folderNameRules,
  FolderController.addFolderPost,
);

export default folderRouter;
