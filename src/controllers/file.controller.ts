import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import upload from "../lib/multer";

const uploadFilePost: RequestHandler[] = [
  upload.single("uploadedFile"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty() || !req.file) {
      return res.status(400).send("Invalid File Payload");
    }

    const userID = res.locals.currentUser.id;
    const folderID = req.params.id;

    const { fileName: customFileName } = matchedData(req);
    const file = req.file;

    console.log({ userID, file, customFileName, folderID });

    return res.redirect(`/folder/${folderID}`);
  },
];

const FileController = {
  uploadFilePost,
};

export default FileController;
