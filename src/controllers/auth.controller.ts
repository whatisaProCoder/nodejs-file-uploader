import { RequestHandler } from "express";
import passport from "passport";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { validationResult, matchedData } from "express-validator";
import { User } from "../generated/prisma/client";

const signUpPageGet: RequestHandler = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/folder/all");
  }
  res.render("sign-up", { oldData: {} });
};

const signUpPagePost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("sign-up", {
      errors: errors.array(),
      oldData: req.body,
    });
  }

  const { firstName, lastName, email, password } = matchedData(req);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
  } catch (error) {
    next(error);
  }

  res.redirect("/auth/log-in");
};

const loginPageGet: RequestHandler = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/folder/all");
  }
  res.render("log-in", { oldData: {} });
};

const loginPagePost: RequestHandler = async (req, res, next) => {
  passport.authenticate(
    "local",
    (err: Error, user: User, info: { message: string }) => {
      if (err) return next(err);

      if (!user) {
        return res.render("log-in", {
          errors: [{ msg: info.message }],
          oldData: { email: req.body.email },
        });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/folder/all");
      });
    },
  )(req, res, next);
};

const logOutGet: RequestHandler = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

const AuthController = {
  signUpPageGet,
  signUpPagePost,
  loginPageGet,
  loginPagePost,
  logOutGet,
};

export default AuthController;
