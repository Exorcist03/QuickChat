// will have funct and variable that will be used in entire application

import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import {io} from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;
// here releted to authentication
export const AuthContext = createContext();

export function AuthProvider  ({children})  {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);

    // check if user is authenticated and if so set the data in req, and connect the socket

    const checkAuth = async() => {
        try {
            const {data} = await axios.get("/api/auth/check");
            if(data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.log("error in checkauth in authcontext.jsx")
            toast.error(error.message);
        }
    }
    // check auth has to be done on every call so useeffect

    useEffect(() => {
        if(token) {
            axios.defaults.headers.common["token"] = token; // set the token
        }
        checkAuth();
    }, [token]);

    // connect socket fucntion to handle socket connection adn online user updates
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUser(userIds);
        })
    }

    //Login functon to handle user authentication and socket connection
    const login = async (state, credentials) => { // based on the state login or signup
        console.log("login function triggered");
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            console.log(" start is ", state);
            console.log(" data is  ", data);
            if(data.success) {
                console.log("inside login in auth provider");
                console.log(data)
                setAuthUser(data.useData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log("error in login func in authcontext.jsx")
            toast.error(error.message);
        }
    }

    // logout function to handle user logout and socket disconnection

    const logout = async() => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out succesfully");
        socket.disconnect();
    }

    // update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const {data} = await axios.put("/api/auth/update-profile", body);
            if(data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated succesfully!!");
            }
        } catch (error) {
            console.log("error in updateprofile in authcontext.jsx")
            toast.error(error.message);
        }
    }

    const value = {
        // whatever state variabes or function i will add here can be acced in any comp using this
        // just add in main.jsx
        axios, token, authUser, onlineUser, socket, login, logout, updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}