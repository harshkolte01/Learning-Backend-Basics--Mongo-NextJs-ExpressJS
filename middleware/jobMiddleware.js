const Jobs = require("../models/Jobs")

exports.validateJobData = async (req, res, next) => {
    try {
        const {title, company} = req.body;
        if(!title || !company) {
            return res.status(400).json({message: "Title or company name is missing"})
        }
        next();
    } catch (error) {
        next(error);
    }
}