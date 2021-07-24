const mongoose = require("mongoose");
const Joi = require("joi");

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  newPassword: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

function validatePasswordReset(data) {
  return Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(8),
    newPassword: Joi.string().min(5).required(),
  }).validate(data);
}

exports.validatePasswordReset = validatePasswordReset;

exports.PasswordReset = PasswordReset;
