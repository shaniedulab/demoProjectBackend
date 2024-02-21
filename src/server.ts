import dotenv from "dotenv";
//file contents into process.env by default
dotenv.config();

import app from "./app";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

// getting  localhost and post from environment file
const hostname: string = process.env.HOSTNAME || 'localhost';
if (!hostname) throw new Error(`port is ${hostname}`);

const port: number = parseInt(process.env.PORT as string, 10);
if (!port) throw new Error(`port is ${port}`);

// connecting to the database
AppDataSource.initialize().then(() => {
    logger.info('Data Source has been initialized!');
    //Listen for connections
    app.listen(port, () => {
        console.log(`Express server is started at http://${hostname}:${port}`);
    });
}).catch((error) => {
    logger.error('Error:  ', error);
});
