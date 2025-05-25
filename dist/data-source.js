"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Contact_1 = require("./entity/Contact");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "contacts.sqlite",
    synchronize: true,
    logging: false,
    entities: [Contact_1.Contact],
});
