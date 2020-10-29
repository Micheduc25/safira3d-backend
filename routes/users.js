const express = require("express");

const router = express.Router();
const _ = require("lodash");

const {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

function cleanUser(userData) {
  return _.pick(userData, ["_id", "name", "email"]);
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
    res.status(201).send(cleanUser(newUser));
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    res.send(cleanUser(updatedUser));
  } catch (err) {
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
