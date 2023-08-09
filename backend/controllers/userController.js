import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import parser from "ua-parser-js";
import User from "../models/userModel.js";
import { generateToken } from "../utlls/index.js";

export const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    
    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields.");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be of 6 characters.");
    }

    // Check if user exists
    const userExists = await User.findOne({email});

    if (userExists) {
        res.status(400);
        throw new Error("Email already in use");
    }

    // Get User Agent
    const ua = parser(req.headers["user-agent"]);
    const userAgent = [ua.ua]

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        userAgent
    });

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),      // 1 day
        sameSite: "none",
        secure: true,
    });

    if (user) {
        const {_id, name, email, phone, bio, photo, role, isVerifed} = user;

        res.status(201).json({
            _id, name, email, phone, bio, photo, role, isVerifed, token
        })
    } else {
        throw new Error("Invalid User data");
    }
});
