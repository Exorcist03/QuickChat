// middleware to protect my routes
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protectRoute = async(req, res, next) => {
    try {
        const token = req.headers.token;
        // console.log(token);
        // console.log(" protect route headers is", req.headers);
        // console.log(process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password"); /// remove password begin stored in user

        if(!user) {
            return res.json({
                success: false,
                message: "User not found!!"
            })
        }
        req.user = user; // 
        next();
    } catch (error) {
        console.log("error in auth.js yayyy");
        console.log(error.message);
        res.json({
                success: false,
                message: error.message
        })
    }
}