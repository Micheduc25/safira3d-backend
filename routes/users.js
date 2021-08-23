const express = require("express");

const router = express.Router();
const _ = require("lodash");
const fs = require("fs/promises");
const config = require("config");

const {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  avatarUpload,
} = require("../controllers/UserController");

const {
  sendEmailVerifyCode,
  confirmEmailVerification,
} = require("../controllers/AuthController");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

function cleanUser(userData) {
  return _.pick(userData, [
    "_id",
    "name",
    "email",
    "avatar",
    "role",
    "is_verified",
  ]);
}

router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    let resUsers = [];
    for (const u of users) resUsers.push(cleanUser(u));
    res.send(resUsers);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.send(cleanUser(user));
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.post("/", async (req, res) => {
  try {
    const newUser = await addUser(
      _.pick(req.body, ["name", "email", "password"])
    );

    //after the user is created we send the verification code
    try {
      await sendEmailVerifyCode(newUser.email);
      res.status(201).send(cleanUser(newUser));
    } catch (err) {
      await deleteUser(newUser._id);
      res.status(err.code).send(err.error);
    }
  } catch (err) {
    console.log(err);

    res.status(err.code).send(err.error);
  }
});

//route to cofirm user virification code
router.post("/verify", async (req, res) => {
  const data = _.pick(req.body, ["email", "code"]);

  try {
    const user = await confirmEmailVerification(data.email, data.code);
    res.status(200).send(user);
  } catch (err) {
    console.log(data);

    res.status(err.code).send(err.error);
  }
});

//route to send user verification email
router.post("/verification", async (req, res) => {
  const data = _.pick(req.body, ["email"]);

  try {
    const message = await sendEmailVerifyCode(data.email);
    res.status(200).send(message);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.put("/:id", [auth, avatarUpload], async (req, res) => {
  const host = req.hostname;

  const filePath =
    req.protocol +
    "://" +
    host +
    (config.get("env") === "development" ? ":" + process.env.PORT : "") +
    "/public/avatars/";

  let updateData = req.body;

  if (req.files && req.files.avatar) {
    updateData.avatar = filePath + req.files.avatar.filename;
  }
  try {
    const updatedUser = await updateUser(req.params.id, updateData);
    res.send(cleanUser(updatedUser));
  } catch (err) {
    try {
      await fs.unlink(req.files.avatar.path);
    } catch (err) {
      console.log(err);
      //pass
    }
    res.status(err.code).send(err.error);
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    res.send(cleanUser(deletedUser));
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

module.exports = router;
