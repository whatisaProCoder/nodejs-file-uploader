import { body } from "express-validator";

const cannotBeEmpty = "cannot be empty";
const maxChars = (maxLength: number) =>
  `must be within ${maxLength} characters`;

const fileUploadRules = [
  body("fileName")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("File name " + cannotBeEmpty)
    .isLength({ max: 100 })
    .withMessage("File name " + maxChars(100)),
];

const fileEditRules = [
  body("fileName")
    .trim()
    .notEmpty()
    .withMessage("File name " + cannotBeEmpty)
    .isLength({ max: 100 })
    .withMessage("File name " + maxChars(100)),
  body("folderID")
    .notEmpty()
    .withMessage("Folder ID not attached")
    .isNumeric()
    .withMessage("Folder ID must be numeric"),
];

const fileValidator = { fileUploadRules, fileEditRules };

export default fileValidator;
