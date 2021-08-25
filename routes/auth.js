const express = require("express");
const auth = require("../middleware/auth");
const { getUser } = require("../controllers/UserController");

const router = express.Router();
const {
  loginUser,
  resetPassword,
  confirmPasswordReset,
  socialLogin,
  socialSignup
} = require("../controllers/AuthController");
router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const result = await loginUser(req.body);
    res.send(result);
  } catch (err) {
    console.log("error is =====>", err);
    res.status(err.code).send(err.error);
  }
});

router.post("social-login",  async (req, res) => {
  try {
    const result = await socialLogin(req.body);
    res.send(result);
  } catch (err) {
    console.log("error is =====>", err);
    res.status(err.code).send(err.error);
  }
} )
router.post("social-signup",  async (req, res) => {
  try {
    const result = await socialSignup(req.body);
    res.send(result);
  } catch (err) {
    console.log("error is =====>", err);
    res.status(err.code).send(err.error);
  }
} )

router.get("/me", auth, async (req, res) => {
  try {
    const user = await getUser(req.user._id);
    if(!user)return res.status(403).send({error:"invalid user"});
    if( user.is_verified)
      res.send({ message: "success", user: user });
    else
      res.status(401).send({error:"User has not been verified"});
  } catch (err) {
    console.log(err);
    res.status(err.code).send(err.error);
  }
});

router.post("/logout", (req, res) => {
  res.send({ message: "success" });
});

router.post("/password/reset", async (req, res) => {
  //  body should contain email and new password
  const data = _.pick( req.body, ['email','password']);

  try {
    await resetPassword(data.email, data.newpassword);
    res.json(`reset email has been sent to ${data.email}!`);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.get("/password/confirm-reset", async (req, res) => {
  const code = req.query.code;
  const email = req.query.email;

  try {
    await confirmPasswordReset(email, code);
    res.send("Votre Mot de passe a été réinitialisé avec succès");
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

module.exports = router;
