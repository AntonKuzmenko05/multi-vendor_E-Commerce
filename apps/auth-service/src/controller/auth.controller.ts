import {NextFunction, Request, Response} from "express";
import {
    checkOtpRestrictions,
    sendOtp,
    trackOtpRequests,
    validateRegistrationData,
    verifyOtp
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs"
import {ValidationError} from "@packages/erorr-handler";

//Register new user
export const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {


        validateRegistrationData(req.body, "user")
        const {name, email} = req.body;

        //Має бути:
        //
        // const existingUser = await prisma.users.findUnique({
        //   where: { email }
        // })
        //
        //
        // Інакше Prisma теж кине помилку — і вона теж прилетить у errorMiddleware.
        const existingUser = await prisma.users.findUnique({where: {email}})

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"))
        }


        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name,email , "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to your email. Please verify"
        })
    }catch (e) {
        return next(e)
    }
}

//verify user via otp
export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, otp, password, name} = req.body;

    if(!email || !otp || !password || !name){
        next(new ValidationError("All fields are required!"))
    }

    const existingUser = await prisma.users.findUnique({where: {email}});

    if (existingUser){
        return next(new ValidationError("User already exists with this email!"))
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.create({
        data:{name, email, password: hashedPassword}
    })

     res.status(201).json({
         success: true,
         message:"User registered successfully!"
     })

    } catch (e) {
        next(e)
    }
}
