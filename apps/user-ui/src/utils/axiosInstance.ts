import axios from "axios";
import {error} from "next/dist/build/output/log";
import * as process from "node:process";


const axiosInstance = axios.create({
    baseURL: process.env["NEXT_PUBLIC_SERVER_URI "],
    withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

const handleLogout = () => {
    if (window.location.pathname === "/login") {
        window.location.href = "/login"
    }
}

//Handle adding a new access token to queued req
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback)
}

//Execute queued req after refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback())
    refreshSubscribers = []
}

//Hndle API req
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

//Handle expired token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        //prevent inf retry loop

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)))
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token-user`,
                    {},
                    {withCredentials: true}
                )

                isRefreshing = false
                onRefreshSuccess()

                return axiosInstance(originalRequest)
            } catch (e) {
                isRefreshing = false;
                refreshSubscribers = []
                handleLogout()
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }


)

export default axiosInstance
