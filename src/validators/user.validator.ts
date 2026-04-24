import prisma from "../lib/prisma";
import { body } from "express-validator";

const cannotBeEmpty = "cannot be empty";
const maxChars = (maxLength: number) =>
  `must be within ${maxLength} characters`;

const signUpRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name " + cannotBeEmpty)
    .bail()
    .isLength({ max: 100 })
    .withMessage("First name " + maxChars(100)),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name " + cannotBeEmpty)
    .bail()
    .isLength({ max: 100 })
    .withMessage("Last name " + maxChars(100)),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("E-Mail " + cannotBeEmpty)
    .bail()
    .isEmail()
    .withMessage("E-Mail is not valid")
    .isLength({ max: 255 })
    .withMessage("E-mail " + maxChars(255))
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { email: value },
      });
      if (user) {
        throw new Error("E-Mail already in use");
      }
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field " + cannotBeEmpty)
    .bail()
    .isLength({ max: 255 })
    .withMessage("Password " + maxChars(255))
    .isLength({ min: 4 })
    .withMessage("Password must be minimum 4 characters"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => value == req.body.password)
    .withMessage("Passwords don't match"),
];

const userValidator = { signUpRules };

export default userValidator;
