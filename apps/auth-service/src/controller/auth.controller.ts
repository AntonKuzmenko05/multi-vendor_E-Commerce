import {NextFunction, Request, Response} from "express";
import {
    checkOtpRestrictions, handleForgotPassword,
    sendOtp,
    trackOtpRequests,
    validateRegistrationData, verifyForgotPasswordOtp,
    verifyOtp
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs"
import {AuthError, ValidationError} from "@packages/erorr-handler";
import jwt from "jsonwebtoken"
import * as process from "node:process";
import {setCookie} from "../utils/cookies/setCookie";

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
        await sendOtp(email, name, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to your email. Please verify"
        })
        //TODO add cookie
    } catch (e) {
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

        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required!"))
        }

        const existingUser = await prisma.users.findUnique({where: {email}});

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"))
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.users.create({
            data: {name, email, password: hashedPassword}
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully!"
        })

    } catch (e) {
        return next(e)
    }
}

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required!"))
        }
        const user = await prisma.users.findUnique({where: {email}})

        if (!user) return next(new AuthError("User doesn't exists!"))

        //verify email
        const isPasswordMatch = await bcrypt.compare(password, user.password!)
        if (!isPasswordMatch) {
            return next(new AuthError("Invalid password or email"))
        }

        //Generate access and refresh token
        const accessToken = jwt.sign({id: user.id, role: "user"}, process.env.ACCESS_TOKET_SECRET as string,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign({id: user.id, role: "user"}, process.env.REFRESH_TOKET_SECRET as string,
            {
                expiresIn: "7d"
            }
        )
        //store tokens
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.json({
            message: "Login successful!",
            user: {id: user.id, email: user.email, name: user.name}
        });

    } catch (e) {
        return next(e)
    }
}

//user forgot password
export const userForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await handleForgotPassword(req, res, next, "user");

}


//Reset user password
export const resetUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, newPassword} = req.body;

        if (!email || !newPassword)
            return next(new ValidationError("Email and password are required!"))

        const user = await prisma.users.findUnique({where: {email}})

        if (!user) return next(new AuthError("User doesn't exists!"))

        //compare new password with the existing one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);

        if (isSamePassword)
            return next(new ValidationError("New password cannot be the same as the old password"))

        //hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: {email},
            data: {password: hashedPassword},
        })

        res.status(200).json({message: "Password reset successfully!"})
    } catch (e) {
        return next(e)
    }
}

export const verifyUserForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await verifyForgotPasswordOtp(req, res, next);
}
