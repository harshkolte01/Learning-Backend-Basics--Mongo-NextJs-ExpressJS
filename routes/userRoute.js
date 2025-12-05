const express = require("express");
const router = express.Router();
const { getUsers, postUsers } = require("../controllers/userController")

router.post("/users", postUsers);
router.get("/users", getUsers);
module.exports = router;