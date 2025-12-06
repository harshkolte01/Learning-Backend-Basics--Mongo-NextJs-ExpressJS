const Jobs = require("../models/Jobs");
const User = require("../models/Users")
const fs = require("fs")
const transporter = require("../middleware/nodeConfig")
const path = require("path")

exports.postJob = async (req, res) => {
    try {
        const job = await Jobs.create(req.body);
        const employees = await User.find({ role: "employee" });
        const templatePath = path.join(__dirname, "Email.html");
        let emailTemplate = fs.readFileSync(templatePath, "utf-8");
        emailTemplate = emailTemplate
            .replace(/{{title}}/g, job.title)
            .replace(/{{company}}/g, job.company || "Not specified")
            .replace(/{{location}}/g, job.location || "Remote / Not specified")
            .replace(/{{createdAt}}/g, job.createdAt.toDateString())
            .replace(/{{salary}}/g, job.salary ? `₹${job.salary}` : "Not disclosed");

        for (let employee of employees) {
            const mailOptions = {
                from: process.env.GOOGLE_EMAIL,
                to: employee.email,
                subject: "new job opportunity",
                html: emailTemplate
            };
            await transporter.sendMail(mailOptions);
        }
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getAllJob = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.location) filter.location = req.query.location;
        const search = req.query.search || "";
        const sortBy = req.query.sort || '-createdAt';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;
        const jobs = await Jobs.find(
            {
                ...filter,
                title: { $regex: search, $options: "i" }
            }
        )
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const totalJobs = await Jobs.countDocuments();
        res.json({
            success: true,
            total: totalJobs,
            page,
            limit,
            skip,
            data: jobs,
        })
    } catch (error) {
        next(error);
    }
}

exports.fetchSingleJob = async (req, res) => {
    const job = await Jobs.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
}

exports.updateJob = async (req, res) => {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
}

exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Jobs.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: "Job Deleted" });
    } catch (error) {
        next(error);
    }
}