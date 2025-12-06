const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.use(require('./pingRoute'));
router.use(require('./userRoute'));
router.use(protect);
router.use(require("./jobRoute"))
module.exports = router;