// Packages
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

// Local imports
import connectDB from "./config/database.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();

// Configure env
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// To handle large file uploads (optional if you use local uploads)
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    })
);

// Use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect DB
connectDB();

// Serve uploaded images statically (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Port
const PORT = process.env.PORT || 8080;

// Default route
app.get("/", (req, res) => {
    res.send("Hello there! Backend is running 🚀");
});

// API routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/user", userRoute);

// If using React frontend build, you can uncomment this:
// app.use(express.static(path.join(__dirname, "../client/dist")));
// app.use("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/dist/index.html"));
// });

// Start server
app.listen(PORT, () => {
    console.log(`✅ SERVER RUNNING ON PORT ${PORT}`);
});
