import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const initialisePassport = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email: string, password: string, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            return done(null, false, { message: "Incorrect Email" });
          }

          const match = await bcrypt.compare(password, user.password);

          if (!match) {
            return done(null, false, { message: "Incorrect Password" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
      });

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export { initialisePassport };
