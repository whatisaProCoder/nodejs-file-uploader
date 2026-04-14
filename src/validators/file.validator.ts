import { body } from "express-validator";

const cannotBeEmpty = "cannot be empty";
const maxChars = (maxLength: number) =>
  `must be within ${maxLength} characters`;

const fileUploadRules = [
  body("fileName")
    .trim()
    .optional()
    .notEmpty()
    .withMessage("File name " + cannotBeEmpty)
    .isLength({ max: 100 })
    .withMessage("File name " + maxChars(100)),
];

const fileValidator = { fileUploadRules };

export default fileValidator;
