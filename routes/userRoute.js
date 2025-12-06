const express = require("express");
const router = express.Router();
const { getUsers, postUsers, signin } = require("../controllers/userController")
const { protect, adminOnly } = require("../middleware/authMiddleware");


router.get("/users", protect, adminOnly, getUsers);
router.post("/users", postUsers);
router.post("/users/signin", signin); 

module.exports = router;