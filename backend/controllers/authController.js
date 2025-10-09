const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

//Register new User
const registerUser = async (req, res) => {
    try{
        const {name, email, password, profileImageUrl} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exist"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
}

//Login User
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid password"});
        }
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message})
    }
}

//Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message})
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};