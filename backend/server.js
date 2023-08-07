import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/connectDb.js";
import userRoute from "./routes/userRoute.js";

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


const PORT = process.env.PORT || 8080;

/* MONGOOSE SETUP */
connectDb();

//Listeners
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server running on PORT: ${PORT}`);
//         })
//     }).catch((error) => console.log(error));


