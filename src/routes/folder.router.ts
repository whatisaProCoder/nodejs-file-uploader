import { Router } from "express";
import FolderController from "../controllers/folder.controller";
import folderValidator from "../validators/folder.validator";

const folderRouter = Router();

folderRouter.get("/all", FolderController.allFoldersPageGet);

folderRouter.post(
  "/new",
  folderValidator.folderNameRules,
  FolderController.addFolderPost,
);

folderRouter.post(
  "/:id/edit",
  folderValidator.folderNameRules,
  FolderController.editFolderPost,
);

export default folderRouter;
