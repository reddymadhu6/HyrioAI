const express = require("express");
const { registerUser, verifyEmail } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);

module.exports = router;
