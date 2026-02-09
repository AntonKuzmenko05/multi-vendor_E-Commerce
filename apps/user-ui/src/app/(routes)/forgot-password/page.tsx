'use client'
import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import * as process from "node:process";
import toast from "react-hot-toast";


type FormData = {
    email:string,
    password:string,
}


const ForgotPassword = () => {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email")
    const [otp, setOtp] = useState(["","","",""])
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<FormData>()

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // clear if unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startResendTimer = () => {
        // clear prev interval
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setTimer(60);
        setCanResend(false);

        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const forgetPasswordMutation = useMutation({
        mutationFn: async ({email}:{email:string})=>{
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,
                {email})
        return response.data;
        },
        onSuccess:(_, {email})=>{
            setUserEmail(email)
            setStep("otp")
            setServerError(null)

        },
        onError: (error:AxiosError) => {
            const errorMessage = (error.response?.data as {message?: string})?.message || "Invalid OTP";
            setServerError(errorMessage)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn:async ()=>{
            if (!userEmail) return
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,

                {email: userEmail, otp: otp.join("")})
            return response.data
        },
        onSuccess: ()=>{
            setStep("reset")
            setServerError(null)
        },
        onError: (error:AxiosError) => {
            const errorMessage = (error.response?.data as {message?: string})?.message || "Invalid OTP";
            setServerError(errorMessage)
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({password}:{password:string})=>{
            if (!password) return
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`,
                {email: userEmail, newPassword:password})
            return response.data
        },
        onSuccess: ()=>{
            setStep("email")
            toast.success(
                "password reset successfully! "
            )
            setServerError(null)
            router.push("/login")
        },
        onError: (error:AxiosError) => {
            const errorMessage = (error.response?.data as {message?: string})?.message || "Invalid OTP";
            setServerError(errorMessage)
        }
    })

    const handleOtpChange = (index:number, value:string) =>{
        if(!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if(value && index < inputRefs.current.length-1){
            inputRefs.current[index+1]?.focus();
        }
    }

    const handleOtpKeyDown = (index:number, e:React.KeyboardEvent<HTMLInputElement>)=>{
        if (e.key === "Backspace" && !otp[index] && index>0){
            inputRefs.current[index-1]?.focus()
        }
    }
    //TODO
    // const onSubmitEmail = ({email:})
    //
    const onSubmit = (data:FormData) =>{

    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
            <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
                ForgotPassword
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Forgot-Password
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                    <h1 className="text-3xl font-semibold text-center mb-2">
                        ForgotPassword to Eshop
                    </h1>
                    <p className="text-center text-gray-500 mb-4">
                        Go back to Login{" "}
                        <Link href={"/login"} className="text-blue-500">
                            Sign Up
                        </Link>
                    </p>


                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input type="email"
                               placeholder="support@gmail.com"
                               className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                               {...register("email", {
                                   required: "Email is required",
                                   pattern: {
                                       value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                       message: "Invalid email"
                                   }
                               })}/>
                        {errors.email && (
                            <p className="text-red-00 text-sm">
                                {String(errors.email.message)}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"

                        > Submit
                        </button>
                        {serverError && (
                            <p className="text-red-500 text-sm mt-2">{serverError}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
