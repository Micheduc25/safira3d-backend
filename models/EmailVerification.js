const mongoose = require("mongoose");
const Joi = require("joi");

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);

function validateEmailVerification(data) {
  return Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
  }).validate(data);
}

exports.validateEmailVerification = validateEmailVerification;

exports.EmailVerification = EmailVerification;
