import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import parser from "ua-parser-js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateToken } from "../utlls/index.js";
import sendEmail from "../utlls/sendEmail.js";

// Register User
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
        const {_id, name, email, phone, bio, photo, role, isVerified} = user;

        res.status(201).json({
            _id, name, email, phone, bio, photo, role, isVerified, token
        })
    } else {
        throw new Error("Invalid User data");
    }
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    
    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password!");
    }

    // Check if user exists
    const user = await User.findOne({email});

    if (!user) {
        res.status(404);
        throw new Error("User not found, Please SignUp");
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
        res.status(400);
        throw new Error("Invalid Email or Password!");
    }

    // Trigger 2FA for unknown UserAgent
    // Generate Token
    const token = generateToken(user._id);

    if (user && passwordIsCorrect) {
        // Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),      // 1 day
            sameSite: "none",
            secure: true,
        });

        const {_id, name, email, phone, bio, photo, role, isVerified} = user;

        res.status(200).json({
            _id, name, email, phone, bio, photo, role, isVerified, token
        });
    } else {
        res.status(500);
        throw new Error("Something went wrong. Please try again!");
    }
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),  
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({message: "Logout Successfully!"});
})

// Get User Profile
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const {_id, name, email, phone, bio, photo, role, isVerified} = user;

        res.status(200).json({
            _id, name, email, phone, bio, photo, role, isVerified
        });
    } else {
        res.status(404);
        throw new Error("User Not Found!");
    }
})

// Update User Profile
export const updateUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const {name, email, phone, bio, photo, role, isVerified} = user;

        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        
        res.status(200).json({
            _id: updatedUser._id,
             name: updatedUser.name,
             email: updatedUser.email,
             phone: updatedUser.phone,
             bio: updatedUser.bio,
             photo: updatedUser.photo,
             role: updatedUser.role,
             isVerified: updatedUser.isVerified,

        });
    } else {
        res.status(404);
        throw new Error("User Not Found!");
    }
})

// Delete a User
export const deleteUser = asyncHandler(async (req, res) => {
    const user = User.findById(req.params.id);
  
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
  
    await user.deleteOne();
    res.status(200).json({
      message: "User deleted successfully",
    });
});

// Get All Users
export const getUsers = asyncHandler (async (req, res) => {
    const users = await User.find().sort("-createdAt").select("-password");

    if (!users) {
        res.status(500);
        throw new Error("Something went wrong!");
    }

    res.status(200).json(users);
})

// get Login Status
export const loginStatus = asyncHandler (async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json(false);
    }

    // Verified Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
        return res.json(true);
    } else {
        return res.json(false);
    }
})

// Upgarde User
export const upgradeUser = asyncHandler (async (req, res) => {
    const {role, id} = req.body;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error("User Not Found!");
    }

    user.role = role;
    await user.save();

    res.status(200).json({message: `User role updated to ${role}`});
})

// Send Automated Emails
export const sendAutomatedEmail = asyncHandler (async (req, res) => {
    const {subject, send_to, reply_to, template, url} = req.body;

    if (!subject || !send_to || !reply_to || !template) {
        es.status(500);
        throw new Error("Missing Email Parameter!");
    }

    // Get User
    const user = await User.findOne({email: send_to});

    if (!user) {
        res.status(404);
        throw new Error("User Not Found!");
    }

    const sent_from = process.env.EMAIL_USER;
    const name = user.name;
    const link = `${process.env.FRONTEND_URL}${url}`;

    try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);

        res.status(200).json({message: "Email Sent!"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again!");
    }

})