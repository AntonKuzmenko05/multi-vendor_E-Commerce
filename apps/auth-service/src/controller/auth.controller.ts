import {NextFunction, Request, Response} from "express";
import {
    checkOtpRestrictions,
    handleForgotPassword,
    sendOtp,
    trackOtpRequests,
    validateRegistrationData,
    verifyForgotPasswordOtp,
    verifyOtp
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs"
import {AuthError, ValidationError} from "@packages/erorr-handler";
import jwt, {JsonWebTokenError} from "jsonwebtoken"
import * as process from "node:process";
import {setCookie} from "../utils/cookies/setCookie";

// Register new user
export const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        validateRegistrationData(req.body, "user")
        const {name, email} = req.body;

        const existingUser = await prisma.users.findUnique({where: {email}})

        if (existingUser) {
            throw new ValidationError("User already exists with this email!")
        }


        await checkOtpRestrictions(email);
        await trackOtpRequests(email);
        await sendOtp(email, name, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to your email. Please verify"
        })
    } catch (e) {
        return next(e)
    }
}

// Verify user via otp
export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, otp, password, name} = req.body;

        if (!email || !otp || !password || !name) {
            throw new ValidationError("All fields are required!")
        }

        const existingUser = await prisma.users.findUnique({where: {email}});

        if (existingUser) {
            throw new ValidationError("User already exists with this email!")
        }

        await verifyOtp(email, otp);

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
            throw new ValidationError("Email and password are required!")
        }

        const user = await prisma.users.findUnique({where: {email}})

        if (!user) throw new AuthError("User doesn't exist!")

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password!)
        if (!isPasswordMatch) {
            throw new AuthError("Invalid password or email")
        }

        // Generate access and refresh token
        const accessToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: "15m"}
        )

        const refreshToken = jwt.sign(
            {id: user.id, role: "user"},
            process.env.REFRESH_TOKEN_SECRET as string,
            {expiresIn: "7d"}
        )

        // Store tokens
        setCookie(res, "refresh_token", refreshToken, "7d");
        setCookie(res, "access_token", accessToken, "15m");

        res.json({
            message: "Login successful!",
            user: {id: user.id, email: user.email, name: user.name}
        });

    } catch (e) {
        return next(e)
    }
}

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refresh_token

        if (!refreshToken){
            throw new ValidationError("Unauthorized! Np refresh token")
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKET_SECRET as string
        ) as {id: string , role: string}

        if(!decoded || !decoded.id || !decoded.role){
            throw new JsonWebTokenError("Forbidden! Invalid refresh  token")
        }
        //
        // let account;
        // if(decoded.role === "user")
         const user = await prisma.users.findUnique({where: {id: decoded.id}})

        if(!user) throw new AuthError("Forbidden! User/Seller not found")

        const newAccessToken = jwt.sign(
            {id:decoded.id, role: decoded.role},
            process.env.ACCESS_TOKET_SECRET as string,
            {expiresIn: "15m" }
        )

        setCookie(res, "access_token", newAccessToken, "15m")

        return res.status(201).json({
            success:true,

        })

    } catch (e) {
        return next(e)
    }
}

//get logged in user
export const getUser = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        res.status(201).json({
            success:true,
            user
        })

    } catch (e) {
        return next(e)
    }
}

// User forgot password
export const userForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await handleForgotPassword(req, res, next, "user");
}

// Reset user password
export const resetUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, newPassword} = req.body;

        if (!email || !newPassword)
            throw new ValidationError("Email and password are required!")

        const user = await prisma.users.findUnique({where: {email}})

        if (!user) throw new AuthError("User doesn't exist!")

        // Compare new password with the existing one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);

        if (isSamePassword)
            throw new ValidationError("New password cannot be the same as the old password")

        // Hash the new password
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
