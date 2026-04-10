import { body } from "express-validator";

const cannotBeEmpty = "cannot be empty";
const maxChars = (maxLength: number) =>
  `must be within ${maxLength} characters`;

const folderNameRules = [
  body("folderName")
    .trim()
    .notEmpty()
    .withMessage("Folder name " + cannotBeEmpty)
    .isLength({ max: 100 })
    .withMessage("Folder name " + maxChars(100)),
];

const folderValidator = { folderNameRules };

export default folderValidator;
