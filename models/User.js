const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

//we add a method to the user to generate his token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    config.get("jwtSecretKey") //    we get the env var related to this setting
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(userData) {
  return Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    role: Joi.string().min(3),
  }).validate(userData);
}

function validateUpdateUser(updateData) {
  return Joi.object({
    name: Joi.string().min(5),
    email: Joi.string().email(),
    password: Joi.string(),
    role: Joi.string().min(3),
  })
    .or("name", "email", "password", "role")
    .validate(updateData);
}

function cleanUser(userData) {
  return _.pick(userData, ["_id", "name", "email", "role"]);
}
exports.User = User;
exports.validateUpdateUser = validateUpdateUser;
exports.validateUser = validateUser;
exports.cleanUser = cleanUser;
