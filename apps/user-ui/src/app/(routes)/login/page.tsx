'use client'
import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";

type FormData = {
    email:string,
    password:string,
}


const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<FormData>()

    const onSubmit = (data:FormData) =>{

    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-white">
            <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
                Login
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Login
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                    <h1 className="text-3xl font-semibold text-center mb-2">
                        Login to Eshop
                    </h1>
                    <p className="text-center text-gray-500 mb-4">
                        Dont have an account? {" "}
                        <Link href={"/signup"} className="text-blue-500">
                            Sign Up
                        </Link>
                    </p>

                    <GoogleButton/>
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300 "/>
                        <span className="px-3">or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300 "/>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input type="email"
                               placeholder="support@gmail.com"
                               className="w-full p-2 border border-gray-300 outline-0 !rounded  mb-1"
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



                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
