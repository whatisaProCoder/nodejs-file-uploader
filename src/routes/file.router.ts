import { Router } from "express";
import fileValidator from "../validators/file.validator";
import FileController from "../controllers/file.controller";

const fileRouter = Router();

fileRouter.post(
  "/:id/edit",
  fileValidator.fileEditRules,
  FileController.editFileNamePost,
);

fileRouter.post("/:id/delete", FileController.deleteFilePost);

fileRouter.get("/:id/download", FileController.downloadFileGet);

fileRouter.post(
  "/:id/share",
  fileValidator.fileShareRules,
  FileController.shareFilePost,
);

fileRouter.get("/:id/share/delete", FileController.deleteShareFileGet);

export default fileRouter;
