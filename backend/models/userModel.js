import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
          ],
    },
    password: {
        type: String,
        required: [true, "Please add a password"]
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80"
    },
    phone: {
        type: String,
        default: "+91-9898980800"
    },
    bio: {
        type: String,
        default: "bio"
    },
    role: {
        type: String,
        required: true,
        default: "subscriber"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userAgent: {
        type: Array,
        required: true,
        default: []
    }
}, {timestamps: true, minimize: false});

const User = mongoose.model("User", userSchema);
export default User;