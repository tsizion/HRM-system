const express = require("express");
const router = express.Router();
const { login } = require("./login");

router.post("/", login); // Read all users

module.exports = router;
