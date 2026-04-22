import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { unlink, mkdir } from "fs/promises";
import prisma from "../lib/prisma";
import FolderService from "../services/folder.service";
import path from "path";
import { get } from "https";
import { createWriteStream } from "fs";

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
    const totalFileSize = await prisma.file.aggregate({
      where: { userID: res.locals.currentUser.id },
      _sum: {
        size: true,
      },
    });

    if (
      Number(totalFileSize._sum.size) + Number(file.size) >
      50 * 1024 * 1024 // 50MB
    ) {
      return res.status(403).render("errorpage", {
        prompt: "Storage Limit Reached for this Account",
      });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "nodejs-file-uploader",
      type: "private",
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
        resource_type: result.resource_type,
        version: String(result.version),
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

  let localTempFilePath: string = "";

  // file name + extension
  let finalDownloadFileName: string = "";

  try {
    const requiredFileData = await prisma.file.findUnique({
      where: { id: fileID, userID: res.locals.currentUser.id },
    });

    if (!requiredFileData) {
      return res
        .status(403)
        .render("errorpage", { prompt: "File Access Denied" });
    }

    const downloadURL = cloudinary.url(requiredFileData.public_id, {
      resource_type: requiredFileData.resource_type,
      version: requiredFileData.version,
      flags: "attachment",
      sign_url: true,
      type: "private",
    });

    finalDownloadFileName = `${requiredFileData.name}.${requiredFileData.ext}`;

    localTempFilePath = path.join(
      process.cwd(),
      "downloads",
      finalDownloadFileName,
    );

    await mkdir(path.dirname(localTempFilePath), { recursive: true });

    const request = get(downloadURL, (response) => {
      response.on("error", async (err) => {
        try {
          await unlink(localTempFilePath);
        } catch (errr) {}
        next(err);
      });

      if (response.statusCode != 200) {
        response.resume();
        return next(
          new Error(
            "Failed to download File : Status Code => " + response.statusCode,
          ),
        );
      }

      const fileStream = createWriteStream(localTempFilePath);

      response.pipe(fileStream);

      fileStream.on("error", async (err) => {
        try {
          await unlink(localTempFilePath);
        } catch (errr) {}
        next(err);
      });

      fileStream.on("finish", () => {
        res.download(localTempFilePath, finalDownloadFileName, async (err) => {
          if (err) {
            try {
              await unlink(localTempFilePath);
            } catch (errr) {}
            next(err);
          } else {
            try {
              await unlink(localTempFilePath);
            } catch (errr) {}
          }
        });
      });
    });

    request.on("error", (err) => next(err));
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
