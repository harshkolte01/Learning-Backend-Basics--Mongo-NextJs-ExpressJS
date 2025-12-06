const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({message: "Unauthorized. Not A Valid Token"});
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(401).json({message: "User not found"});
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({message: "No token found", error: error.message});
    }
}

exports.adminOnly = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({message: "Admin only Route"});
        }
    } catch (error) {
        next(error);
    }
}