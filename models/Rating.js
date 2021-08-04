const mongoose = require("mongoose");
const Joi = require("joi");

const ratingSchema = new mongoose.Schema({
  value: {
    type: Number,
    default: 0,
    required: true,
  },
  raterId: {
    type: String,
    required: true,
  },
  moduleId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

function validateRating(rating) {
  return Joi.object({
    value: Joi.number().min(0).max(5).required(),
    raterId: Joi.string().required(),
    moduleId: Joi.string().required(),
  }).validate(rating);
}

exports.Rating = Rating;
exports.validateRating = validateRating;
