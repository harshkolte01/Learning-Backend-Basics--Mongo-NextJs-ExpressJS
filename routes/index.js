const express = require("express");
const router = express.Router();

router.use(require('./pingRoute'));
router.use(require('./userRoute'));
router.use(require("./jobRoute"))
module.exports = router;