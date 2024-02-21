import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./config/route.config";
import globalErrorHandling from "./api-errors/api-error.controller";

//Creates an Express application
const app:Application = express();

//using middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/public', express.static('./src/public'));
app.use('/api', router);

//Global error handling  middleware
app.use(globalErrorHandling);

//sample route for test server
app.get('/', (req:Request, res:Response) => {
    res.status(200).send('Welcome to Express App');
});

//Error response for unknown route
app.all('*', (req: Request, res: Response) => {
    return res.status(404).json({ status: 404, message: `Can't find ${req.originalUrl} on the server!` });
});

export default app;