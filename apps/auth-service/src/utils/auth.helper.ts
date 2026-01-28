import {ValidationError} from "@packages/erorr-handler";
import {NextFunction, Request, Response} from "express";
import * as crypto from "node:crypto";
import redis from "@packages/redis";
import {sendEmail} from "./sendMail";
import Redis from "../../../../packages/redis";
import {afterEach} from "node:test";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const {name, email, password, phone_number, country} = data;

    if (
        !name || !email || !password || (userType === 'seller' && (!phone_number || !country))
    ) {
        throw new ValidationError("Missing required fields");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format")
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 min"))
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests! Please wait 1 hour"))
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 minute before requesting new OTP!"))
    }
}

export const sendOtp = async (email: string ,name: string , template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300)
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
    //
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey) || "0"));

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600) //Lock for 1 hour
        return next(new ValidationError("Too many OTP requests! Please wait 1 hour")) //?????
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600)
}

//
export const verifyOtp = async (email:string, otp:string, next:NextFunction)=>{
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp){
        throw next(new ValidationError("Invalid or expired OTP!"))//TODO throw vs return
    } //???

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey) || "0"))

    if(storedOtp !== otp){ // == or ===
        if(failedAttempts >= 2){
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800)// Block for 30 minutes
            await redis.del(`otp:${email}`, failedAttemptsKey)

            throw next(new ValidationError(
                "Too many failed attempts. Your account is locked for 30 minutes" // TODO add that
            ))
        }
        await redis.set(failedAttemptsKey, failedAttempts+1, "EX", 300)
        throw next(new ValidationError(
            `Incorrect OTP. ${2-failedAttempts} attempts left.`
        ))
    }
    await redis.del(`otp:${email}`, failedAttemptsKey)
}

export const handleForgotPassword = async(
    req: Request,
    res: Response,
    next: NextFunction,
    userType: "user" | "seller"
) =>{
    try {
        const {email} = req.body;
        if (!email) return new ValidationError("Email is required")

        const user = userType === "user" && await prisma.users.findUnique({where:email})

        if(!user) return new ValidationError(`${userType} not found`);

        //Check otp
        await checkOtpRestrictions(email,next);
        await trackOtpRequests(email, next);

        //Generate otp and send to email
        await sendOtp(email, user.name, "forgot-password-user-mail");

        res.status(200).json({message: "OTP sent to email. Please verify your account"})
    } catch (e) {
        return next(e)
    }


}

export const verifyForgotPasswordOtp = async(
    req: Request,
    res: Response,
    next: NextFunction
) =>{
    try {
        const {email, otp} = req.body;
        if (!email || !otp) return new ValidationError("Email is required")

        await verifyOtp(email, otp, next)

        res
            .status(200)
            .json({message: "OTP verified. Tou can now rest your password"})

    } catch (e) {
        return next(e)
    }
}
