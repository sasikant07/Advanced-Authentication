import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import userRoute from "./routes/userRoute.js";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000/", "https://authz-app.vercel.app"],
    credentials: true,
}));

// Routes
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
    res.send("Home Page");
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

/* MONGOOSE SETUP */
connectDB();

//Listeners
app.listen(PORT, () => {
    console.log(`Node Server running on port ${PORT}`);
});

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server running on PORT: ${PORT}`);
//         })
//     }).catch((error) => console.log(error));


