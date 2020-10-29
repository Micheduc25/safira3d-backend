const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User, cleanUser } = require("../models/User");
const _ = require("lodash");
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

exports.loginUser = loginUser;
