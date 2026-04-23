import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import FileStreamUtil from "../utils/file.stream";

const folderPageGet: RequestHandler = async (req, res) => {
  const shareID = String(req.params.shareID);

  const folderShareObject = await prisma.folderShare.findUnique({
    where: { id: shareID, expiresAt: { gt: new Date() } },
    include: {
      user: true,
      folder: { include: { files: true } },
    },
  });

  if (folderShareObject)
    res.render("sharedfolder", { folderShareObject: folderShareObject });
  else
    res.status(404).render("errorpage", {
      prompt: "No Shared Folder Found",
    });
};

const filesInPublicFolderDownloadGet: RequestHandler = async (
  req,
  res,
  next,
) => {
  const shareID = String(req.params.shareID);
  const fileID = Number(req.params.fileID);

  const shareObject = await prisma.folderShare.findUnique({
    where: { id: shareID, expiresAt: { gt: new Date() } },
  });

  if (!shareObject)
    return res.status(404).render("errorpage", {
      prompt: "No Shared Folder Found",
    });

  try {
    const requiredFileData = await prisma.file.findUnique({
      where: { id: fileID, folderID: shareObject.folderID },
    });

    if (!requiredFileData) {
      return res.status(403).render("errorpage", {
        prompt: "File Access Denied. Its not in this shared public folder.",
      });
    }

    await FileStreamUtil.downloadFile(requiredFileData, res, next);
  } catch (err) {
    return next(err);
  }
};

const filePageGet: RequestHandler = async (req, res) => {
  const shareID = String(req.params.shareID);

  const fileShareObject = await prisma.fileShare.findUnique({
    where: { id: shareID, expiresAt: { gt: new Date() } },
    include: {
      user: true,
      file: true,
    },
  });

  if (fileShareObject)
    res.render("sharedfile", { fileShareObject: fileShareObject });
  else
    res.status(404).render("errorpage", {
      prompt: "No Shared File Found",
    });
};

const downloadSharedFileGet: RequestHandler = async (req, res, next) => {
  const shareID = String(req.params.shareID);

  const fileShareObject = await prisma.fileShare.findUnique({
    where: { id: shareID },
    include: { file: true },
  });

  if (!fileShareObject)
    return res.status(404).render("errorpage", {
      prompt: "No Shared File Found",
    });

  try {
    const requiredFileData = fileShareObject.file;

    if (!requiredFileData) {
      return res.status(403).render("errorpage", {
        prompt: "File Access Denied. Its not a shared public file.",
      });
    }

    await FileStreamUtil.downloadFile(requiredFileData, res, next);
  } catch (err) {
    return next(err);
  }
};

const PublicShareController = {
  folderPageGet,
  filesInPublicFolderDownloadGet,
  filePageGet,
  downloadSharedFileGet,
};

export default PublicShareController;
