import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";
import prisma from "../lib/prisma";
import FolderService from "../services/folder.service";

const uploadFilePost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty() || !req.file) {
    return res.status(400).send("Invalid File Payload");
  }

  const userID = Number(res.locals.currentUser.id);
  const folderID = Number(req.params.id);

  const { fileName: customFileName } = matchedData(req);

  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "nodejs-file-uploader",
    });

    const name =
      customFileName ??
      file.originalname.substring(0, file.originalname.indexOf("."));

    await prisma.file.create({
      data: {
        name,
        url: result.secure_url,
        size: file.size,
        ext: file.mimetype.substring(file.mimetype.lastIndexOf("/") + 1),
        userID,
        folderID,
        public_id: result.public_id,
      },
    });
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
      res.status(403).send("Folder Access Denied");
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

    const result = await cloudinary.uploader.destroy(file.public_id);
    if (result.result != "ok") {
      new Error("Could not delete file from Cloudinary");
    }
  } catch (err) {
    return next(err);
  }

  res.redirect(`/folder/${folderID}`);
};

const FileController = {
  uploadFilePost,
  editFileNamePost,
  deleteFilePost,
};

export default FileController;
