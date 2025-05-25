import { DataSource } from "typeorm";
import { Contact } from "./entity/Contact";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "contacts.sqlite",
  synchronize: true,
  logging: false,
  entities: [Contact],
});
