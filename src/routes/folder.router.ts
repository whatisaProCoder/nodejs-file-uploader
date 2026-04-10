import { Router } from "express";
import DashboardController from "../controllers/folder.controller";

const folderRouter = Router();

folderRouter.get("/all", DashboardController.allFoldersPageGet);

export default folderRouter;
