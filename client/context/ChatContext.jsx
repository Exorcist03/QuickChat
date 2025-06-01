import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

import { createContext, useState, useContext, useEffect } from "react";


export const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [messages, setMessages] = useState([]);//  will store messages for thsis user
    const [users, setUsers] = useState([]); // stores l ist of used for left side bar
    const [selectedUsers, setSelectedUsers] = useState(null); // stores to which user we want to chat
    const [unseenMessages, setUnseenMessages] = useState({}); // {key, value} for this user the no of unseen msgs for a user {userid, cnt}

    const {socket , axios}  = useContext(AuthContext);

    // func to get all the suers for sidebar
    const getUsers = async () => {
        try {
            const {data} = axios.get("/api/messages/users");
            if(data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //func to get msg for selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to send msg to selected user
    const sendMessage = async(messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUsers._id}`, messageData);
            if(data.success) {
                setMessages((prevMessages) => {[...prevMessages], data.newMessage});
            } else {
                toast.error(error.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //fucn to get messages in realtime
    const subscribeToMessages = async () => {
        if(!socket) return;

        socket.on("newMessage", async (newMessage) => {
            if(selectedUsers && newMessage.senderId === selectedUsers._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => {[...prevMessages, newMessage]});
                await axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages) =>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1;
                }))
            }
        })
    }


    // func to unsubscribe from messages
    const unsubscribeFromMessages = async() => {
        if(socket) socket.off("newMessage");
    }

    // both func should run whenever we open the webpage
    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUsers])

    const value = {
        messages, users, selectedUsers, getUsers, setMessages, sendMessage, setSelectedUsers, unseenMessages, setUnseenMessages
    }
    return (
        <ChatContext.Provider value = {value}>
            {children}
        </ChatContext.Provider>
    )
}
