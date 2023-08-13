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
    sendAutomatedEmail
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


export default router;