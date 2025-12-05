const Jobs = require("../models/Jobs");

exports.postJob = async (req, res) => {
    try {
        const job = await Jobs.create(req.body);
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