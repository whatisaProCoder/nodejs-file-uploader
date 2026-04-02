import { configDotenv } from "dotenv";

// import env variables
configDotenv();

// import libraries
import express, { Express } from "express";

const app: Express = express();

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
