const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

SALT_ROUND = Number(process.env.PASSWORD_SALT_ROUNDS);
JWT_EXPIRY = process.env.JWT_EXPIRY;
SECRET_KEY = process.env.JWT_SECRET_KEY;
exports.postUsers = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const exitingUser = await User.findOne({email});
        if (exitingUser) {
            return res.status(400).json({message: "User already exist with this email."});
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
        const user = new User({name, email, password:hashedPassword});
        await user.save();
        res.status(201).json({message: "User registered successfully"})
    } catch (error) {
        next(error);
    }
}

exports.signin = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: 'Invalid Credentials'});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: 'Invalid Password'});
        const token = jwt.sign({userId:user._id, email:user.email}, SECRET_KEY, {expiresIn: JWT_EXPIRY});
        res.json({token, message: "Login Successful"});
    } catch (error) {
        next(error);
    }
}

exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
}