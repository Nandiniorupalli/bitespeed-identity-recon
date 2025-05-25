import { DataSource } from "typeorm";
import { Contact } from "./entity/Contact";
import path from "path";

const dbPath = path.join(__dirname, "../contacts.sqlite");

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: dbPath,
  synchronize: true,
  logging: false,
  entities: [Contact],
});
