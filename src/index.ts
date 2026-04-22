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
import { isAuth } from "./middleware/auth.middleware";
import folderRouter from "./routes/folder.router";
import fileRouter from "./routes/file.router";
import publicShareRouter from "./routes/publicshare.router";
import nodeCron from "node-cron";

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

app.use("/folder", isAuth, folderRouter);

app.use("/file", isAuth, fileRouter);

app.use("/publicshare", publicShareRouter);

app.get("/{*splat}", (_req, res) => {
  res.status(404).render("errorpage", { prompt: "404 | Page Not Found" });
});

app.use(errorMiddleware);

const PORT: string = process.env.PORT || "3500";

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`✅ Server running at port : ${PORT}`);
});

nodeCron.schedule(
  "0 0 0 * * *",
  async () => {
    const now = new Date();
    await prisma.folderShare.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    await prisma.fileShare.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
  },
  { timezone: "UTC" }, // db saves expiry date in UTC format
);
