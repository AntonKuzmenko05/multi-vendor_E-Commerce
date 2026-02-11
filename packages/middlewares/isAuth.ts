import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import * as process from "node:process";
import prisma from "@packages/libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) =>{

    try {
        const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({message:"Unauthorized! Token missing "})
        }
        //verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKET_SECRET!) as {
            id:string;
            role: 'user' | "seller"
        }
        if (!decoded){
            return res.status(401).json({message:"Unauthorized! Invalid Token  "})
        }

        const account = await prisma.users.findUnique({where:{id:decoded.id}})

        req.user = account;

        if(!account){
            return res.status(401).json({message:"Account not found "})
        }

        return next()
    } catch (e) {
        return res.status(401).json({message:"Account not found "})
    }
}

export default isAuthenticated;
