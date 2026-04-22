import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { get } from "node:https";
import { mkdir, unlink } from "node:fs/promises";

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
      prompt: "No Shared Folder Found for this Share-ID.",
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
      prompt: "No Shared Folder Found for this Share-ID.",
    });

  // if valid share object for this shareID is found

  let localTempFilePath: string = "";

  // file name + extension
  let finalDownloadFileName: string = "";

  try {
    const requiredFileData = await prisma.file.findUnique({
      where: { id: fileID, folderID: shareObject.folderID },
    });

    if (!requiredFileData) {
      return res.status(403).render("errorpage", {
        prompt: "File Access Denied. Its not in this shared public folder.",
      });
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

const filePageGet: RequestHandler = async (req, res) => {
  const shareID = String(req.params.shareID);

  const fileShareObject = await prisma.fileShare.findUnique({
    where: { id: shareID, expiresAt: { gt: new Date() } },
    include: {
      user: true,
      file: true,
    },
  });

  console.log(fileShareObject);

  if (fileShareObject)
    res.render("sharedfile", { fileShareObject: fileShareObject });
  else
    res.status(404).render("errorpage", {
      prompt: "No Shared File Found for this Share-ID.",
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
      prompt: "No Shared File Found for this Share-ID.",
    });

  // if valid share object for this shareID is found

  let localTempFilePath: string = "";

  // file name + extension
  let finalDownloadFileName: string = "";

  try {
    const requiredFileData = fileShareObject.file;

    if (!requiredFileData) {
      return res.status(403).render("errorpage", {
        prompt: "File Access Denied. Its not a shared public file.",
      });
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

const PublicShareController = {
  folderPageGet,
  filesInPublicFolderDownloadGet,
  filePageGet,
  downloadSharedFileGet,
};

export default PublicShareController;
