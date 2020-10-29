const express = require("express");
const auth = require("../middleware/auth");
const { getUser } = require("../controllers/UserController");

const router = express.Router();
const { loginUser } = require("../controllers/AuthController");
router.post("/login", async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.send(result);
  } catch (err) {
    console.log("error is =====>", err);
    res.status(err.code).send(err.error);
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await getUser(req.user._id);
    res.send({ message: "success", user: user });
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.post("/logout", (req, res) => {
  res.send({ message: "success" });
});

module.exports = router;
