import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import parser from "ua-parser-js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Cryptr from "cryptr";
import {OAuth2Client} from "google-auth-library";

import User from "../models/userModel.js";
import { generateToken, hashToken } from "../utlls/index.js";
import sendEmail from "../utlls/sendEmail.js";
import Token from "../models/tokenModel.js";

const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const userAgent = [ua.ua];

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
    // Get User Agent
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;

    console.log(thisUserAgent);

    const allowedAgent = user.userAgent.includes(thisUserAgent);

    if (!allowedAgent) {
        // Generate 6 digit code
        const loginCode = Math.floor(100000 + Math.random() * 900000);

        // Encrypt Login Code before saving to DB
        const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

        // Delete Token if it exists in DB
        let userToken = await Token.findOne({userId: user._id});

        if (userToken) {
            await userToken.deleteOne();
        }

        // Save Token to DB
        await new Token({
            userId: user._id,
            lToken: encryptedLoginCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000),    // 1 hour
        }).save();

        res.status(400);
        throw new Error("New browser or device detected");
    }

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

// Send Login Code
export const sendLoginCode = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const user = await User.findOne({email});

    if (!user) {
        res.status(404);
        throw new Error("User Not Found!");
    }

    // Find Login Code in the DB
    let userToken = await Token.findOne({userId: user._id, expiresAt: {$gt: Date.now()}});

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token. Please login again");
    }

    const loginCode = userToken.lToken;
    const decryptedLoginCode = cryptr.decrypt(loginCode);

    // Send Login Code
    const subject = "Login Access Code - AUTH:Z";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@zino.com";
    const template = "loginCode";
    const name = user.name;
    const link = decryptedLoginCode;
 
     try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);

        res.status(200).json({message: `Access code sent to ${email}`});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again!");
    }

});

// Login With Code
export const loginWithCode = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { loginCode } = req.body;

    const user = await User.findOne({email});

    if (!user) {
        res.status(404);
        throw new Error("User Not Found!");
    }

    // Find User Login Token
    const userToken = await Token.findOne({userId: user._id, expiresAt: {$gt: Date.now()}});

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token. Please login again");
    }

    const decryptedLoginCode = cryptr.decrypt(userToken.lToken);

    if (loginCode !== decryptedLoginCode) {
        res.status(400);
        throw new Error("Incorrect login code. Please try again");
    } else {
        // Register userAgent
        const ua = parser(req.headers["user-agent"]);
        const thisUserAgent = ua.ua;
        user.userAgent.push(thisUserAgent);
        await user.save();

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

        const {_id, name, email, phone, bio, photo, role, isVerified} = user;

        res.status(200).json({
            _id, name, email, phone, bio, photo, role, isVerified, token
        })
    }
});

// Send Verification Email
export const sendVerificationEmail = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error("User already verified");
    }

    // Delete Token if it exists in DB
    let token = await Token.findOne({userId: user._id});

    if (token) {
        await token.deleteOne();
    }

    // Create Verification Token and Save
    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

    console.log(verificationToken);

    // Hash token and save
    const hashedToken = hashToken(verificationToken);
    await new Token({
        userId: user._id,
        vToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * (60 * 1000),    // 1 hour
    }).save();

    // Construct a Verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    // Send Email
    const subject = "Verify Your Account - AUTH:Z";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@zino.com";
    const template = "verifyEmail";
    const name = user.name;
    const link = verificationUrl;

    try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);

        res.status(200).json({message: "Verification Email Sent!"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again!");
    }
});

// Verify User
export const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    const hashedToken = hashToken(verificationToken);

    const userToken = await Token.findOne({
        vToken: hashedToken,
        expiresAt: {$gt: Date.now()}
    });

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token");
    }

    // Find User
    const user = await User.findOne({_id: userToken.userId});

    if (user.isVerified) {
        res.status(400);
        throw new Error("User is already verified");
    }

    // Now verify user
    user.isVerified = true;
    await user.save();

    res.status(200).json({message: "Account Verification Successfull!"});

})

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

});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({email});

    if (!user) {
        res.status(404);
        throw new Error("No User with this email");
    }

    // Delete Token if it exists in DB
    let token = await Token.findOne({userId: user._id});

    if (token) {
        await token.deleteOne();
    }

    // Create Verification Token and Save
    const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    console.log(resetToken);

    // Hash token and save
    const hashedToken = hashToken(resetToken);
    await new Token({
        userId: user._id,
        rToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * (60 * 1000),    // 1 hour
    }).save();

    // Construct a Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

    // Send Email
    const subject = "Password Reset Request - AUTH:Z";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@zino.com";
    const template = "forgotPassword";
    const name = user.name;
    const link = resetUrl;

    try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);

        res.status(200).json({message: "Password Reset Email Sent!"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again!");
    }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const hashedToken = hashToken(resetToken);

    const userToken = await Token.findOne({
        rToken: hashedToken,
        expiresAt: {$gt: Date.now()}
    });

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token");
    }

    // Find User
    const user = await User.findOne({_id: userToken.userId});

    // Now Reset Password
    user.password = password;
    await user.save();

    res.status(200).json({message: "Password Reset Successfull. Please Login!"});
});

// Change Password
export const changePassword = asyncHandler (async (req, res) => {
    const { oldPassword, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User Not Found!");
    }

    if (!oldPassword || !password) {
        res.status(400);
        throw new Error("Please enter old and new password");
    }

    // Check if old password is correct
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // Save New Password
    if (user && passwordIsCorrect) {
        user.password = password;
        await user.save();

        res.status(200).json({message: "Password changed successfully. Please login again"})
    } else {
        res.status(400);
        throw new Error("Old Password is incorrect!");
    }
});

// Login With Google
export const loginWithGoogle = asyncHandler(async (req, res) => {
    const {userToken} = req.body;

    const ticket = await client.verifyIdToken({
        idToken: userToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const {name, email, picture, sub} = payload;
    const password = Date.now() + sub;


    // Get User Agent
    const ua = parser(req.headers["user-agent"]);
    const userAgent = [ua.ua];

    // Check if user exists
    const user = await User.findOne({email});

    if (!user) {
        // Create new user
        const newUser = await User.create({
            name,
            email,
            password,
            photo: picture,
            isVerified: true,
            userAgent
        });

        if (newUser) {
            // Generate Token
            const token = generateToken(newUser._id);
    
            // Send HTTP-only cookie
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400),      // 1 day
                sameSite: "none",
                secure: true,
            });

            const {_id, name, email, phone, bio, photo, role, isVerified} = newUser;
    
            res.status(201).json({
                _id, name, email, phone, bio, photo, role, isVerified, token
            })
        }
    }

    // User Exists, Login
    if (user) {
        const token = generateToken(user._id);
    
        // Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),      // 1 day
            sameSite: "none",
            secure: true,
        });

        const {_id, name, email, phone, bio, photo, role, isVerified} = user;
    
        res.status(201).json({
            _id, name, email, phone, bio, photo, role, isVerified, token
        })
    }
});