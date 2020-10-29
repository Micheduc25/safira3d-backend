const mongoose = require("mongoose");
const Joi = require("joi");

const safiraModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  main_color: String,
  secondary_color: String,

  categories: {
    type: Array,
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "a safira module must belong to atleast one category",
    },
  },

  date: {
    default: Date.now,
    type: Date,
  },
  related_images: [String],

  foreground_image: {
    type: String,
    required: true,
  },
  background_image: {
    type: String,
    required: true,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const SafiraModule = mongoose.model("SafiraModule", safiraModuleSchema);

function validateModule(module) {
  return Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(1).required(),
    location: Joi.string().required(),
    main_color: Joi.string(),
    secondary_color: Joi.string(),
    categories: Joi.array().min(1).required(),
    foreground_image: Joi.string().required(),
    background_image: Joi.string().required(),
    creator: Joi.string().required(),
  }).validate(module);
}

function validateUpdateModule(updateData) {
  return Joi.object({
    title: Joi.string().min(5),
    description: Joi.string().min(1),
    location: Joi.string(),
    main_color: Joi.string(),
    secondary_color: Joi.string(),
    categories: Joi.array().min(1),
    foreground_image: Joi.string(),
    background_image: Joi.string(),
    creator: Joi.string().required(),
  })
    .or(
      "title",
      "description",
      "location",
      "main_color",
      "secondary_color",
      "categories",
      "foreground_image",
        "background_image",
      "creator"
    )

    .validate(updateData);
}
exports.SafiraModule = SafiraModule;
exports.validateModule = validateModule;
exports.validateUpdateModule = validateUpdateModule;
