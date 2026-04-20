import prisma from "../lib/prisma";

const getUserFolders = async (userID: number) => {
  return await prisma.folder.findMany({
    where: {
      authorID: userID,
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
};

const getUserFolder = async (userID: number, folderID: number) => {
  return await prisma.folder.findUnique({
    where: { id: folderID, authorID: userID },
    include: {
      files: true,
    },
  });
};

const FolderService = {
  getUserFolders,
  getUserFolder,
};

export default FolderService;
