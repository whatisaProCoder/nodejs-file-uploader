import prisma from "../lib/prisma";

const getUserFolders = async (userID: number) => {
  const folders = await prisma.folder.findMany({
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

      folderShares: {
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          expiresAt: true,
        },
      },
    },
  });

  const fileSizes = await prisma.file.groupBy({
    by: ["folderID"],
    _sum: { size: true },
  });

  const fileSizesMap = new Map(
    fileSizes.map((file) => [file.folderID, file._sum.size || 0]),
  );

  return folders.map((folder) => {
    return { ...folder, totalSize: fileSizesMap.get(folder.id) || 0 };
  });
};

const getUserMetric = async (userID: number) => {
  const numberOfFolders = await prisma.folder.count({
    where: { authorID: userID },
  });

  const numberOfFiles = await prisma.file.count({
    where: { userID: userID },
  });

  const fileSizesSum = await prisma.file.aggregate({
    where: { userID: userID },
    _sum: {
      size: true,
    },
  });

  const totalSize = 50 * 1024 * 1024;

  return { numberOfFiles, numberOfFolders, fileSizesSum, totalSize };
};

const getUserFolder = async (userID: number, folderID: number) => {
  return await prisma.folder.findUnique({
    where: { id: folderID, authorID: userID },
    include: {
      files: {
        include: {
          fileShares: true,
        },
      },
    },
  });
};

const FolderService = {
  getUserFolders,
  getUserMetric,
  getUserFolder,
};

export default FolderService;
