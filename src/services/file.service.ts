import AppError from "../errors/app.error";
import prisma from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

const uploadFile = async (
  userID: number,
  folderID: number,
  file: Express.Multer.File,
  customFileName: string | null,
) => {
  const totalFileSize = await prisma.file.aggregate({
    where: { userID: userID },
    _sum: {
      size: true,
    },
  });

  if (
    Number(totalFileSize._sum.size) + Number(file.size) >
    50 * 1024 * 1024 // 50MB
  ) {
    throw new AppError(403, "Storage Limit Reached for this Account");
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
};

const FileService = { uploadFile };

export default FileService;
