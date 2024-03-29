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
  avatar:{
    type:String,
    default:""
  },

  password: {
    type: String,
  },

  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  is_verified:{
    type:Boolean,
    default:false,
    required:true
  },

  social_id:{
    type:String,
  
  }
});

//we add a method to the user to generate his token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      is_verified:this.is_verified,
      avatar:this.avatar
    },
    process.env.JWT_SECRET_KEY //    we get the env var related to this setting
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(userData) {
  return Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().required().email(),
    password: Joi.string(),
    role: Joi.string().min(3),
    avatar:Joi.string(),
    social_id:Joi.string()
  }).validate(userData);
}

function validateUpdateUser(updateData) {
  return Joi.object({
    name: Joi.string().min(5),
    email: Joi.string().email(),
    password: Joi.string(),
    role: Joi.string().min(3),
    avatar:Joi.string(),
    social_id:Joi.string()
  })
    .or("name", "email", "password", "role","avatar","social_id")
    .validate(updateData);
}

function cleanUser(userData) {
  return _.pick(userData, ["_id", "name", "email", "role","is_verified","avatar"]);
}
exports.User = User;
exports.validateUpdateUser = validateUpdateUser;
exports.validateUser = validateUser;
exports.cleanUser = cleanUser;
