import jwt from "jsonwebtoken";

// gen a token for a user
export const generateToken = async(userId)=>{
    const token =  jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}