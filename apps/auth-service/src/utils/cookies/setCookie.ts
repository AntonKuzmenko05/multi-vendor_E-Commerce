import {Response} from "express";
import {parseTimeToMs} from "./timeParser";


//TODO https://claude.ai/chat/6ff04154-9b1d-4af1-9e2d-792de85734ad
export const setCookie = (
    res:Response, name:string, value:string, maxAge: string | number = "7d"
)=>{
    res.cookie(name, value, {
        maxAge: parseTimeToMs(maxAge),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })

}
