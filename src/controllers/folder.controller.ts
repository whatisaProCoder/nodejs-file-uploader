import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import FolderService from "../services/folder.service";

const allFoldersPageGet: RequestHandler = async (_req, res) => {
  const allFolders = await FolderService.getUserFolders(
    res.locals.currentUser.id,
  );

  res.render("folders", {
    allFolders,
  });
};

const addFolderPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const allFolders = await FolderService.getUserFolders(
      res.locals.currentUser.id,
    );
    return res.status(400).render("folders", {
      errors: errors.array(),
      allFolders,
    });
  }

  const { folderName } = matchedData(req);

  try {
    await prisma.folder.create({
      data: { name: folderName, authorID: res.locals.currentUser.id },
    });
  } catch (error) {
    next(error);
  }

  res.redirect("/folder/all");
};

const editFolderPost: RequestHandler = async (req, res, next) => {
  const folderID = Number(req.params.id);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const allFolders = await FolderService.getUserFolders(
      res.locals.currentUser.id,
    );

    return res.status(400).render("folders", {
      errors: errors.array(),
      allFolders,
    });
  }

  const { folderName } = matchedData(req);

  try {
    await prisma.folder.update({
      where: {
        id: folderID,
      },
      data: {
        name: folderName,
      },
    });
  } catch (err) {
    next(err);
  }

  res.redirect("/folder/all");
};

const FolderController = {
  allFoldersPageGet,
  addFolderPost,
  editFolderPost,
};

export default FolderController;
