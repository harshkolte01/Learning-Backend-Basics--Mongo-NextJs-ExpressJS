const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {type: String, required: true},
    company: {type: String},
    location: {type: String},
    salary: Number,
    createdAt:{type: Date, default: Date.now},
});

const Jobs = mongoose.model("Jobs", jobSchema);
module.exports = Jobs;