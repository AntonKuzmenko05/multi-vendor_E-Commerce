import express from 'express';
import cors from "cors";
import {errorMiddleware} from "../../../packages/erorr-handler/error-middleware";
import cookieParser = require("cookie-parser");
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json"); //TODO convert to import

// const host = process.env.HOST ?? 'localhost';
// const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ['Authorization', "Content-Type"],
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api", router)

app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(swaggerDocument) as any) //TODO change
app.get("/docs-json", (req, res)=>{
    res.json(swaggerDocument)
})

app.use(errorMiddleware)

app.get('/', (req, res) => {
    res.send({'message': 'Hello API'});
});
const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`[ ready ] Auth-Service on http://localhost:${port}`);
});

server.on("error", err => {
    console.log("Server error in Auth-Service api", err)
})

