import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";
import prisma from "../lib/prisma";
import FolderService from "../services/folder.service";
import FileService from "../services/file.service";
import FileStreamUtil from "../utils/file.stream";

const uploadFilePost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty() || !req.file) {
    return res
      .status(400)
      .render("errorpage", { prompt: "Invalid File Payload" });
  }

  const userID = Number(res.locals.currentUser.id);
  const folderID = Number(req.params.id);

  const { fileName: customFileName } = matchedData(req);

  const file = req.file;
  if (!file) {
    return res.status(400).render("errorpage", { prompt: "No file uploaded" });
  }

  try {
    await FileService.uploadFile(userID, folderID, file, customFileName);
  } catch (err: any) {
    return next(err);
  } finally {
    try {
      await unlink(file.path);
    } catch (err) {
      console.error("File Cleanup Error :", err);
    }
  }

  return res.redirect(`/folder/${folderID}`);
};

const editFileNamePost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const folderID = Number(req.body.folderID);
  const fileID = Number(req.params.id);

  if (!errors.isEmpty()) {
    const folder = await FolderService.getUserFolder(
      res.locals.currentUser.id,
      folderID,
    );

    if (folder) {
      return res.status(400).render("folder", {
        folder,
        errors: errors.array(),
      });
    } else {
      res.status(403).render("errorpage", { prompt: "File Access Denied" });
    }

    return;
  }

  const { fileName } = matchedData(req);

  try {
    await prisma.file.update({
      where: {
        id: fileID,
        userID: res.locals.currentUser.id,
      },
      data: {
        name: fileName,
      },
    });
  } catch (err) {
    return next(err);
  }

  res.redirect(`/folder/${folderID}`);
};

const deleteFilePost: RequestHandler = async (req, res, next) => {
  const folderID = Number(req.body.folderID);
  const fileID = Number(req.params.id);

  try {
    const file = await prisma.file.delete({
      where: {
        id: fileID,
        userID: res.locals.currentUser.id,
      },
    });

    if (file) {
      const result = await cloudinary.uploader.destroy(file.public_id);
      if (result.result != "ok") {
        new Error("Could not delete file from Cloudinary");
      }
    } else {
    }
  } catch (err) {
    return next(err);
  }

  res.redirect(`/folder/${folderID}`);
};

const downloadFileGet: RequestHandler = async (req, res, next) => {
  const fileID = Number(req.params.id);

  try {
    const requiredFileData = await prisma.file.findUnique({
      where: { id: fileID, userID: res.locals.currentUser.id },
    });

    if (!requiredFileData) {
      return res
        .status(403)
        .render("errorpage", { prompt: "File Access Denied" });
    }

    await FileStreamUtil.downloadFile(requiredFileData, res, next);
  } catch (err) {
    return next(err);
  }
};

const shareFilePost: RequestHandler = async (req, res, next) => {
  const fileID = Number(req.params.id);
  const folderID = Number(req.body.folderID);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const folder = await FolderService.getUserFolder(
      res.locals.currentUser.id,
      folderID,
    );

    return res.status(400).render("folder", {
      folder,
      errors: errors.array(),
    });
  }

  const { duration } = matchedData(req);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + Number(duration));

  try {
    await prisma.fileShare.create({
      data: {
        userID: res.locals.currentUser.id,
        fileID: fileID,
        expiresAt: expiryDate,
      },
    });
  } catch (err) {
    next(err);
  }

  res.redirect(`/folder/${folderID}`);
};

const deleteShareFileGet: RequestHandler = async (req, res, next) => {
  const fileID = Number(req.params.id);
  const folderID = Number(req.query.folderID);

  try {
    await prisma.fileShare.delete({
      where: {
        fileID_userID: {
          fileID: fileID,
          userID: res.locals.currentUser.id,
        },
      },
    });
  } catch (err) {
    next(err);
  }

  res.redirect(`/folder/${folderID}`);
};

const FileController = {
  uploadFilePost,
  editFileNamePost,
  deleteFilePost,
  downloadFileGet,
  shareFilePost,
  deleteShareFileGet,
};

export default FileController;
