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
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
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
    console.log(`Server running on port ${PORT}`);
});
