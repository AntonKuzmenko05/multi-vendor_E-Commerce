'use client'
import React, {useRef, useState} from 'react';
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";
import {Eye, EyeOff} from "lucide-react";

type FormData = {
    email:string,
    password:string,
    name:string,
}


const Signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["","","",""])
    const [userData, setUserData] = useState<FormData | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<FormData>()

    const onSubmit = (data:FormData) =>{

    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
            <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
                Sign Up
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Sign Up
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                    <h1 className="text-3xl font-semibold text-center mb-2">
                        Sign Up to Eshop
                    </h1>
                    <p className="text-center text-gray-500 mb-4">
                        Have an account? {" "}
                        <Link href={"/login"} className="text-blue-500">
                            Login
                        </Link>
                    </p>

                    <GoogleButton/>
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300 "/>
                        <span className="px-3">or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300 "/>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <label className="block text-gray-700 mb-1">Name</label>
                        <input type="text"
                               placeholder="Wijab"
                               className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                               {...register("name", {
                                   required: "Name is required",
                               })}/>
                        {errors.name && (
                            <p className="text-red-00 text-sm">
                                {String(errors.name.message)}
                            </p>
                        )}

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

                        <label className="block text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input type={passwordVisible ? "text":"password"}
                                   placeholder="Min 6 characters"
                                   className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                                   {...register("password", {
                                       required:"Password is required",
                                       minLength:{
                                           value:6,
                                           message: "Password must be at least 6 "
                                       }
                                   })}
                            />

                            <button type="button" onClick={()=>setPasswordVisible(!passwordVisible)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                {passwordVisible ? <Eye/> : <EyeOff/>}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-sm">
                                {String(errors.password.message)}
                            </p>
                        )}


                        <button
                            type="submit"
                            className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"

                        >
                            Sign Up
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

export default Signup;
