const User = require('../models/Users')

exports.postUsers = async (req, res) => {
    const {name, email, password} = req.body;
    const user = new User({name, email, password});
    await user.save();
    res.send('User is saved in DB successfully');
}

exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
}