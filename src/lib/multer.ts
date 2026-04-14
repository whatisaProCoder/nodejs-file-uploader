import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 1024 * 1024 * 15 },
});

export default upload;
