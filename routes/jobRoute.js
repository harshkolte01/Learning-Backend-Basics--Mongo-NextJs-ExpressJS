const express = require("express");
const router = express.Router();
const { getAllJob, postJob, fetchSingleJob, updateJob, deleteJob } = require("../controllers/jobController")
const { validateJobData } = require("../middleware/jobMiddleware")

router.get("/jobs", getAllJob); // adding one job
router.get("/jobs/:id", fetchSingleJob); // getting single job
router.put("/jobs/:id", updateJob); // update single job of id
router.delete("/jobs/:id", deleteJob); // delete that job
router.post("/jobs", validateJobData, postJob); // post 1 job jobs


module.exports = router;