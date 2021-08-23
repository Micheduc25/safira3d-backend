const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const config = require("config");
const {
  getAllModules,
  getModule,
  addModule,
  updateModule,
  deleteModule,
  imagesUpload,
  likeModule,
  unlikeModule,
  viewModule,
  rateModule,
} = require("../controllers/ModuleController");

const Joi = require("joi");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const authOrReadonly = require("../middleware/authOrReadonly");
// const { config } = require("dotenv");

const router = express.Router();

router.get("/", authOrReadonly, async (req, res) => {
  // console.log("origin===>",req.header('Origin'));
  const user = req.user;
  try {
    const result = await getAllModules(user ? user._id : null);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/:id", authOrReadonly, async (req, res) => {
  const { error } = Joi.string().min(1).validate(req.params.id);

  if (!error) {
    try {
      const module = await getModule(req.params.id);

      if (module) res.send(module);
      else res.status(404).send("could not find module");
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("The given id is invalid");
  }
});

router.post("/", [auth, admin, imagesUpload], async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No file was selected");
    return;
  } else {
    if (!req.files.foreground_image) {
      res.status(400).send("No Foreground image file was selected");

      return;
    }

    if (!req.files.background_image) {
      res.status(400).send("No Background image file was selected");
      return;
    }
  }
  const host = req.hostname;

  //remove the port later
  let filePath =
    req.protocol +
    "://" +
    host +
    (config.get("env") === "development" ? ":" + process.env.PORT : "") +
    "/public/module_images/";

  let moduleFields = req.body;
  moduleFields.foreground_image =
    filePath + req.files.foreground_image[0].filename;
  moduleFields.background_image =
    filePath + req.files.background_image[0].filename;

  try {
    //we add the creator of the course and create the module
    moduleFields.creator = req.user._id;
    moduleFields.categories = JSON.parse(moduleFields.categories);
    const result = await addModule(moduleFields);

    res.status(201).send({
      message: "Successfully added module",
      data: result,
    });
  } catch (err) {
    //if an error occurs we delete the files which were saved
    try {
      await fs.unlink(req.files.foreground_image[0].path);
    } catch (err) {
      console.log(err);
      //pass
    }
    try {
      await fs.unlink(req.files.background_image[0].path);
    } catch (err) {
      console.log(err);
      //pass
    }
    res.status(err.code).send({ error: err.error });
  }
});

router.put("/:id", [auth, admin, imagesUpload], async (req, res) => {
  const { error } = Joi.string().min(1).validate(req.params.id);

  if (!error) {
    try {
      const host = req.hostname;

      //remove the port later
      let filePath =
        req.protocol +
        "://" +
        host +
        (config.get("env") === "development" ? ":" + process.env.PORT : "") +
        "/public/module_images/";

      let updateFields = req.body;

      if (req.files && req.files.foreground_image) {
        updateFields.foreground_image =
          filePath + req.files.foreground_image[0].filename;
      }
      if (req.files && req.files.background_image) {
        updateFields.background_image =
          filePath + req.files.background_image[0].filename;
      }

      if (updateFields.categories)
        updateFields.categories = JSON.parse(updateFields.categories);

      const result = await updateModule(req.params.id, updateFields, req.user);
      res.send({
        message: "successfully updated module",
        data: result,
      });
    } catch (err) {
      res.status(err.code).send(err.error);
    }
  } else res.status(400).send("The id sent was invalid");
});

router.put("/like/:id", auth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;

  try {
    const result = await likeModule(id, userId);
    res.send(result.message);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});
router.put("/unlike/:id", auth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;

  try {
    const result = await unlikeModule(id, userId);
    res.send(result.message);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});
router.put("/view/:id", auth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;

  try {
    const result = await viewModule(id, userId);
    res.send(result.message);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.put("/rate/:id", auth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;
  const value = req.body.rating;

  try {
    const result = await rateModule(id, userId, value);
    res.send(result);
  } catch (err) {
    res.status(err.code).send(err.error);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const { error } = Joi.string().min(1).validate(req.params.id);

  if (!error) {
    try {
      const result = await deleteModule(req.params.id, req.user);
      res.send({
        message: "successfully deleted module",
        deleted_data: result,
      });
    } catch (err) {
      res.status(err.code).send(err.error);
    }
  } else res.status(422).send("The id sent was invalid");
});

module.exports = router;
