import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// for chatting get all the users except the logged in user
export const getUserForSideBar = async (req, res) => {
    try {
        const userId = req.user._id; // will add middleware so req.user will be ther
        // get all the users whose userId is not this
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password"); // don't have password here
        // count the no of unseen passwords here for this userId for other users
        let unseenMessages = {}; // an object
        const promises = filteredUsers.map( async (user) => {
            const mess = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            if(mess.length > 0) {
                unseenMessages[user._id] = mess.length;
            }
        });
        // pause here until every Message.find() has resolved
        await Promise.all(promises);
        res.json({
            success: true,
            users: filteredUsers,
            unseenMessages
        })
    } catch (error) {
        console.log("get user for sidebar error in msgcontrolleer.js");
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// get all the messages of the logged in user with a given user from params
export const getMessages = async (req, res) => {
    try {
        const {id : selectedUserId} = req.params;
        const myId = req.user._id; // from the middleware

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        // at the same time mark the chats as read
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});
        res.json({
            success: true,
            messages
        })
    } catch (error) {
        console.log("error in getmsg controllers.js ")
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// api to mark msg seen through message id
export const markMessageSeen = async (req, res) => {
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen: true});
        res.json({success: true});
    } catch (error) {
        console.log("error in markmsgseen in msgcontrollers.js");
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        // if i have the image upload to cloudinary
        let imageUrl;
        if(image) {
            const resp = await cloudinary.uploader.upload(image);
            imageUrl = resp.secure_url;
        }
        // save all things to db
        const newMessage = await Message.create({
            senderId, receiverId, text, image: imageUrl
        })
        // this message has to be instantaneously shown in recievers chat ---> i ll use socket io

        // emit the msg to reciever socket
        const recieverSocketId = userSocketMap[receiverId];
        if(recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        res.json({
            success: true,
            newMessage
        })

    } catch (error) {
        console.log("error in sendmessage in msgcontroller.js");
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}