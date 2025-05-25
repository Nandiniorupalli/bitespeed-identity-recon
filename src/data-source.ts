// data-source.ts

import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: ["dist/entity/*.js"],
  migrations: [],
  subscribers: [],
});
