import { DataSource } from "typeorm";
import "reflect-metadata";
import path from "path";
import { User } from "../modules/user/user.model";
import * as dotenv from 'dotenv';

// Load the .env file
dotenv.config();

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Get the current filename and extension for migration location
const currentFilename = __filename;
const fileExtension = path.extname(currentFilename);
const migrationLocation = fileExtension === ".ts" ? "./src/migration/*.ts" : "";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User],
  migrationsTableName: "migration_table",
  migrations: [migrationLocation],
  subscribers: [],
});
