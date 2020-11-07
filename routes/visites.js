const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", (req, auth, res) => {});

module.exports = router;
