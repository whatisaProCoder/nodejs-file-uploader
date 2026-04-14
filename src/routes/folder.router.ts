import { Router } from "express";
import FolderController from "../controllers/folder.controller";
import folderValidator from "../validators/folder.validator";
import FileController from "../controllers/file.controller";
import fileValidator from "../validators/file.validator";

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

folderRouter.post("/:id/delete", FolderController.deleteFolderPost);

folderRouter.post(
  "/:id/file",
  fileValidator.fileUploadRules,
  FileController.uploadFilePost,
);

folderRouter.get("/:id", FolderController.folderPageGet);

export default folderRouter;
