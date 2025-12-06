const express = require("express");
const router = express.Router();
const { getUsers, postUsers, signin } = require("../controllers/userController")
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload")


router.get("/users", protect, adminOnly, getUsers);
router.post("/users", upload.single("pic"), postUsers);
router.post("/users/signin", signin); 

module.exports = router;