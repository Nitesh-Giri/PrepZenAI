const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer ")){
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }else{
            return res.status(401).json({ message: "Not authorized, token missing" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};

module.exports = { protect };


