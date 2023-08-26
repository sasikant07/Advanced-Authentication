import express from "express";
const router = express.Router();
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUser, 
    updateUser, 
    deleteUser, 
    getUsers, 
    loginStatus, 
    upgradeUser, 
    sendAutomatedEmail,
    sendVerificationEmail,
    verifyUser,
    forgotPassword,
    resetPassword,
    changePassword,
    sendLoginCode,
    loginWithCode,
    loginWithGoogle
} from "../controllers/userController.js";
import { adminOnly, authorOnly, protect } from "../middleware/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/getUsers", protect, authorOnly, getUsers);
router.get("/loginStatus", loginStatus);
router.post("/upgradeUser", protect, adminOnly, upgradeUser);

// Email ROutes
router.post("/sendAutomatedEmail", protect, sendAutomatedEmail);
router.post("/sendVerificationEmail", protect, sendVerificationEmail);
router.patch("/verifyUser/:verificationToken", verifyUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.patch("/changePassword", protect, changePassword);

router.post("/sendLoginCode/:email", sendLoginCode);
router.post("/loginWithCode/:email", loginWithCode);

// Google Login Routes
router.post("/google/callback", loginWithGoogle);


export default router;