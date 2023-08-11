import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = asyncHandler (async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            res.status(401);
            throw new Error("Not Authorized. Please Login!");
        }

        // Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Get User id from Token
        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            res.status(404);
            throw new Error("User Not Found!");
        }

        if (user.role === "suspended") {
            res.status(400);
            throw new Error("User Susupended! Please contact support.");
        }

        req.user = user;    // assign user to req.user just like req.body OR req.params
        next();

    } catch (error) {
        res.status(401);
        throw new Error("Not Authorized. Please Login!");
    }
});

export const authorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "author" || req.user.role === "admin") {
        next();
    } else {
        res.status(401);
        throw new Error("Not Authorized as an Author");
    }
})

export const verifiedOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next();
    } else {
        res.status(401);
        throw new Error("Not Authorized, Account not Verified!");
    }
})

export const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401);
        throw new Error("Not Authorized as an Admin");
    }
})
