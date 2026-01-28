import {Response} from "express";

export const setCookie = (res:Response, name:string, value:string)=>{
    res.cookie(name,value,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // prevents XSS attacks
        sameSite: "none", // prevents CSRF attacks
        // secure: process.env.NODE_ENV === "production",
    })

}
