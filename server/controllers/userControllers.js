import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// signup a new user
export const signup = async (req, res) => {
    const {fullName, password, email, bio} = req.body;
    try{
        if(!fullName || !password || !email || !bio) {
            return res.json({sucess: false, message: "Details missing!"});
        }
        const user = await User.findOne({email});
        console.log("user got ", user);
        if(user) {
            return res.json({success: false, message: "Account already exists!"});
        }

        // now i will not save the same pass instead use the hashed pass using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, bio, password: hashedPassword
        })
        // const token = generateToken(newUser._id);
        const token = await generateToken(newUser._id);
        // console.log(token);

        // await newUser.save();
        res.json({
            success: true, userData: newUser, token, 
            message: "New user created succesfully!"
        });

    }catch(error) {
        console.log("sign up error");
        console.log(error.message);

        res.json({success: false, message: error.message});
    }
}

// login for user
export const login = async(req, res) => {
    console.log("login func");
    try{
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        console.log(userData)

        if(!userData) {
            res.json({
                success: false, message: "Email doesn't exist!"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if(!isPasswordCorrect) {
            res.json({success: false, message: "Incorrect credentials"});
        }
        const token = await generateToken(userData._id);

        res.json({
            success: true, userData, token, 
            message: "Login Succesfull!!!"
        });

    }
    catch(error){
        console.log(error.message);

        res.json({success: false, message: error.message});
    }
}

// controller for authenticating the user
export const checkAuth = async(req, res) => {
    res.json({success: true, user: req.user});
}

// controller to update user profile detais
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;

        // req.user i will add using the middleware
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic) { // if profilePic not updated
            updatedUser = await User.findOneAndUpdate(userId, {bio, fullName}, {new: true}); // new: true will give me the updated details
        } else {
            // if pp updated then i will first have to upload it on cloudinary and get the url
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findOneAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }
        res.json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}
