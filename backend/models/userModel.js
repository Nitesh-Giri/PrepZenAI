const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
    },
    profileImageUrl:{
        type: String,
        default: null
    }, 
},{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);