const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User, cleanUser } = require("../models/User");
const _ = require("lodash");
const { sendMail } = require("./MailController");
const randString = require("crypto-random-string");
const {
  validatePasswordReset,
  PasswordReset,
} = require("../models/PasswordReset");
// const jwt = require("jsonwebtoken");
// const config = require("config");

function validateLogin(loginData) {
  return Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(5).required(),
  }).validate(loginData);
}

async function loginUser(loginData) {
  return new Promise(async (resolve, reject) => {
    console.log("login data ===>", loginData);
    const { error } = validateLogin(loginData);

    if (error) reject({ code: 400, error: error.details[0].message });
    else {
      let user;
      try {
        user = await User.findOne({
          email: loginData.email,
        });
      } catch (err) {
        reject({ code: 500, error: err });
      }

      if (!user) reject({ code: 400, error: "Invalid email or password" });
      else {
        let validPassword = false;
        try {
          validPassword = await bcrypt.compare(
            loginData.password,
            user.password
          );
        } catch (err) {
          reject({ code: 500, error: err });
        }

        if (!validPassword)
          reject({ code: 400, error: "Invalid email or password" });
        else {
          //we generate a token here which we will send to the user
          const token = user.generateAuthToken();

          resolve({
            message: "success",
            user: cleanUser(user),
            token: token,
          });
        }
      }
    }
  });
}

async function resetPassword(email, newpassword) {
  return new Promise(async (resolve, reject) => {
    //  we generate a code that will be used to authenticate the user
    //  and we send an email to the user for him to confirm the reset
    const code = randString({ length: 8 });

    const response = {
      body: {
        name: email,
        intro: `Vous avez recu ce mail parceque vous avez demandé à réinitialiser votre mot de passe`,

        action: {
          instructions:
            "Cliquez sur le bouton ci dessous pour réinitialiser votre mot de passe",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Reinitialiser Mot de Passe",
            link: `http://locahost:5000/api/auth/password/confirm-reset?code=${code}&email=${email}`,
          },
        },
        outro:
          "Si vous n'avez pas fait de requete pour réinitialiser votre mot de passe, ignorer ce mail",
      },
    };

    try {
      //  we send the mail here
      const res = await sendMail(email, "Réinitialiser Mot de Passe", response);

      //we hash the new password for security and store the password reset request in the db
      const salt = await bcrypt.genSalt(10);
      const newpassHash = await bcrypt.hash(newpassword, salt);
      const passReset = new PasswordReset({
        email: email,
        code: code,
        newPassword: newpassHash,
      });

      await passReset.save();

      //  After 30mins hour we delete the request to avoid database crowding

      // setTimeout(() => {
      //   passReset.deleteOne().catch((err) => {
      //     console.log("we could not delete the request==>", err);
      //   });
      // }, 2000000);

      resolve(res);
    } catch (err) {
      reject({ code: 500, error: err });
    }
  });
}

async function confirmPasswordReset(email, code) {
  return new Promise(async (resolve, reject) => {
    //  we attempt to retrieve the request with this code and email
    let passReset;
    try {
      passReset = await PasswordReset.findOne({ email, code });
    } catch (err) {
      reject({
        code: 400,
        error: "The email or code are not valid",
      });
    }

    if (passReset) {
      try {
        //  when the request is found, we find the user with the email and set his new password
        await User.updateOne(
          {
            email,
          },
          {
            $set: {
              password: passReset.newPassword,
            },
          }
        );

        //  After successfully updating the password, we delete the request from the database
        await passReset.deleteOne();

        resolve("Password reset Confirmed!");
      } catch (err) {
        reject({ code: 500, error: err });
      }
    } else
      reject({ code: 404, error: "Could not find the password reset request" });
  });
}

exports.loginUser = loginUser;
exports.resetPassword = resetPassword;
exports.confirmPasswordReset = confirmPasswordReset;
