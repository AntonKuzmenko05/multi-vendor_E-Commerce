import {ValidationError} from "../../../../packages/erorr-handler";
import {NextFunction} from "express";
import * as crypto from "node:crypto";
import redis from "../../../../packages/redis";
import {sendEmail} from "./sendMail";
import Redis from "../../../../packages/redis";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (data:any,userType:"user" | "seller")=>{
    const {name, email, password, phone_number, country} = data;

    if(
        !name || !email || !password || (userType === 'seller' && (!phone_number || !country))
      )
    {
        throw new ValidationError("Missing required fields");
    }

    if(emailRegex.test(email)){
      throw new ValidationError("Invalid email format")
    }
}

export const checkOtpRestrictions = async(email:string, next:NextFunction) =>{
    if(await redis.get(`otp_lock:${email}`)){
        return next(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 min"))
    }
    if(await redis.get(`otp_spam_lock:${email}`)){
        return next(new ValidationError("Too many OTP requests! Please wait 1 hour"))
    }
}

export const sendOtp = async(name:string, email:string, template:string)=>{
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300)
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
    //
}

