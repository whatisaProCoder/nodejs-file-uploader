import { Router } from "express";
import FolderController from "../controllers/folder.controller";
import folderValidator from "../validators/folder.validator";
import FileController from "../controllers/file.controller";
import fileValidator from "../validators/file.validator";
import upload from "../lib/multer";

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
  upload.single("uploadedFile"),
  fileValidator.fileUploadRules,
  FileController.uploadFilePost,
);

folderRouter.post(
  "/:id/share",
  folderValidator.folderShareRules,
  FolderController.shareFolderPost,
);

folderRouter.get("/:id/share/delete", FolderController.deleteShareFolderGet);

folderRouter.get("/:id", FolderController.folderPageGet);

export default folderRouter;
