/**
 * TODO
 * import { Request } from 'express';
 *
 * standardHeaders: 'draft-7', // Рекомендовано для нових версій
 * legacyHeaders: false, // Вимикає застарілі заголовки X-RateLimit-*
 *
 *
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import rateLimit from "express-rate-limit";
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
  origin:["http://localhost:3000"],
  allowedHeaders:['Authorization', "Content-Type"],
  credentials:true,
}))

app.use(morgan("dev"));
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({limit:"100mb", extended:true}))
app.use(cookieParser())
app.set("trust proxy",1)
app.use('/assets', express.static(path.join(__dirname, 'assets')));


const limiter = rateLimit({
    windowMs:15*60*1000,
    limit: (req: any) => {
      // Якщо користувач авторизований — 1000 запитів, якщо ні — 100
      return req.user ? 1000 : 100;
    },
    message:{error: "Too many requests. please try again later"},
    standardHeaders: true,
    legacyHeaders:true,
    //keyGenerator:(req:any)=>req.ip,
    //validate: { xForwardedForHeader: false }, // Допомагає уникнути певних помилок валідації

})

app.use(limiter)

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/', proxy("http://localhost:6001"));


const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
