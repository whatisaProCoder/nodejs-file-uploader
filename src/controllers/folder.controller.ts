import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import prisma from "../lib/prisma";

const allFoldersPageGet: RequestHandler = async (_req, res) => {
  const allFolders = await prisma.folder.findMany({
    where: {
      authorID: res.locals.currentUser.id,
    },

    orderBy: { createdAt: "asc" },

    select: {
      id: true,
      name: true,
      createdAt: true,

      _count: {
        select: {
          files: true,
        },
      },
    },
  });

  res.render("folders", {
    keepAddFolderDialogOpen: false,
    oldData: {},
    allFolders,
  });
};

const addFolderPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("folders", {
      errors: errors.array(),
      oldData: req.body,
      keepAddFolderDialogOpen: true,
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

const FolderController = {
  allFoldersPageGet,
  addFolderPost,
};

export default FolderController;
