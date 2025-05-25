import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import identifyRouter from "./routes/identify";

const app = express();
const PORT = 3000;

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.use("/identify", identifyRouter);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error("Data Source init error:", error));
