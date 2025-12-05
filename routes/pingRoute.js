const express = require("express");
const router = express.Router();
const { getPing } = require("../controllers/pingController")
router.get("/ping", getPing);
module.exports = router;