require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectedDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const sessionRoutes = require("./routes/sessionRoute");
const questionRoutes = require("./routes/questionRoute");
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");
const app = express();

const PORT = process.env.PORT || 5005;

app.use(
    cors({
        origin: function (origin, callback) {
            // Allowed origins from environment variable or defaults
            const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
            
            if (!allowedOrigins.length) {
                // Fallback if env var not set
                allowedOrigins.push(
                    "https://prepzenai.vercel.app",
                    "https://prepzenai.vercel.app/",
                    "http://localhost:5173",
                    "http://localhost:8008"
                );
            }
            
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

connectedDB();
//Middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

//Server upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

app.get("/", (req, res) => {
    res.send("Server is running");
})
//Start server
app.listen(PORT, () => {
    // server started
    console.log(`Server started on port ${PORT}`);
});
