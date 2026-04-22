import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import prisma from "../lib/prisma";
import FolderService from "../services/folder.service";

const allFoldersPageGet: RequestHandler = async (_nextreq, res) => {
  const allFolders = await FolderService.getUserFolders(
    res.locals.currentUser.id,
  );

  const userMetrics = await FolderService.getUserMetric(
    res.locals.currentUser.id,
  );

  res.render("folders", {
    allFolders,
    userMetrics,
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
        authorID: res.locals.currentUser.id,
      },
      data: {
        name: folderName,
      },
    });
  } catch (err) {
    return next(err);
  }

  res.redirect("/folder/all");
};

const deleteFolderPost: RequestHandler = async (req, res, next) => {
  const folderID = Number(req.params.id);

  try {
    await prisma.folder.delete({
      where: { id: folderID, authorID: res.locals.currentUser.id },
    });
  } catch (err) {
    return next(err);
  }

  res.redirect("/folder/all");
};

const folderPageGet: RequestHandler = async (req, res) => {
  const folderID = Number(req.params.id);

  const folder = await FolderService.getUserFolder(
    res.locals.currentUser.id,
    folderID,
  );

  if (folder) res.render("folder", { folder: folder });
  else {
    res.status(403).render("errorpage", { prompt: "Folder Access Denied" });
  }
};

const shareFolderPost: RequestHandler = async (req, res, next) => {
  const folderID = Number(req.params.id);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const allFolders = await FolderService.getUserFolders(
      res.locals.currentUser.id,
    );

    const userMetrics = await FolderService.getUserMetric(
      res.locals.currentUser.id,
    );

    return res.status(400).render("folders", {
      allFolders,
      userMetrics,
      errors: errors.array(),
    });
  }

  const { duration } = matchedData(req);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + Number(duration));

  try {
    await prisma.folderShare.create({
      data: {
        userID: res.locals.currentUser.id,
        folderID: folderID,
        expiresAt: expiryDate,
      },
    });
  } catch (err) {
    next(err);
  }

  res.redirect("/folder/all");
};

const deleteShareFolderGet: RequestHandler = async (req, res, next) => {
  const folderID = Number(req.params.id);

  try {
    await prisma.folderShare.delete({
      where: {
        folderID_userID: {
          folderID: folderID,
          userID: res.locals.currentUser.id,
        },
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
  deleteFolderPost,
  folderPageGet,
  shareFolderPost,
  deleteShareFolderGet,
};

export default FolderController;
