import "dotenv/config";
import express, { Express } from "express";
import path from "node:path";
import session from "express-session";
import prisma from "./lib/prisma";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { initialisePassport } from "./config/passport";
import passport from "passport";
import userMiddleware from "./middleware/user.middleware";
import errorMiddleware from "./middleware/error.middleware";
import homeRouter from "./routes/home.router";
import authRouter from "./routes/auth.router";

const app: Express = express();

app.use(express.static(path.join(__dirname, "../public")));

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  }),
);

initialisePassport();

app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

app.use(userMiddleware);

// routes

app.use("/", homeRouter);

app.use("/auth", authRouter);

app.get("/{*splat}", (_req, res) => {
  res.status(404).send("404");
});

app.use(errorMiddleware);

const PORT: string = process.env.PORT || "3500";

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`✅ Server running at port : ${PORT}`);
});
