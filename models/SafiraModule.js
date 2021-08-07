const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./User");
const { Double } = require("mongodb");

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
  rating: {
    type: Number,
    min: 0.0,
    max: 5.0,
    default: 0.0,
  },

  raters: {
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  likers: {
    type: [String],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },

  viewers: {
    type: [String],
    default: [],
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

  visit_url: {
    type: String,
  },
  app_id: {
    type: String,
    default: "",
  },
  apk_url: { type: String, default: "" },

  is_complete: {
    type: Boolean,
    default: true,
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
    rating: Joi.number().min(0).max(5),
    likes: Joi.number().min(0),
    views: Joi.number().min(0),
    likers: Joi.array(),
    viewers: Joi.array(),
    is_complete: Joi.boolean(),
    visit_url: Joi.string().allow(null,""),
    app_id: Joi.string().allow(null, ""),
    apk_url: Joi.string().allow(null, ""),
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
    creator: Joi.string(),
    rating: Joi.number().min(0).max(5),
    likes: Joi.number().min(0),
    views: Joi.number().min(0),
    likers: Joi.array(),
    viewers: Joi.array(),
    visit_url: Joi.string().allow(null,""),
    is_complete: Joi.boolean(),
    app_id: Joi.string().allow(null, ""),
    apk_url: Joi.string().allow(null, ""),
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
      "creator",
      "rating",
      "likers",
      "viewers",
      "visit_url",
      "app_id",
      "apk_url",
      "is_complete"
    )
    .validate(updateData);
}
exports.SafiraModule = SafiraModule;
exports.validateModule = validateModule;
exports.validateUpdateModule = validateUpdateModule;
