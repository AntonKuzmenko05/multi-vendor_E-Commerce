import {ValidationError} from "../../../../packages/erorr-handler";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (data:any,userType:"user" | "seller")=>{
    const {name, email, password, phone_number, country} = data;

    if(
        !name || !email || !password || (userType === 'seller' && (!phone_number || !country))
      )
    {
        return new ValidationError("Missing required fields");
    }
}
