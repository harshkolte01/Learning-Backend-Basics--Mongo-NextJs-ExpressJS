const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["employer", "admin", "employee"],
        default: "employee",
    },
    pic: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;