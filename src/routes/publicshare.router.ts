import { Router } from "express";
import PublicShareController from "../controllers/publicshare.controller";

const publicShareRouter = Router();

publicShareRouter.get("/folder/:shareID", PublicShareController.folderPageGet);

publicShareRouter.get(
  "/folder/:shareID/file/:fileID/download",
  PublicShareController.filesInPublicFolderDownloadGet,
);

publicShareRouter.get("/file/:shareID", PublicShareController.filePageGet);

publicShareRouter.get(
  "/file/:shareID/download",
  PublicShareController.downloadSharedFileGet,
);

export default publicShareRouter;
