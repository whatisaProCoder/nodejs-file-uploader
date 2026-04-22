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

const folderShareRules = [
  body("duration")
    .notEmpty()
    .withMessage("Duration" + cannotBeEmpty)
    .isInt({ min: 1, max: 60 })
    .withMessage("Duration must be integer (days)"),
];

const folderValidator = { folderNameRules, folderShareRules };

export default folderValidator;
