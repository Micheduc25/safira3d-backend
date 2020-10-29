const express = require("express");
const {
  getAllModules,
  getModule,
  addModule,
  updateModule,
  deleteModule,
  imagesUpload,
} = require("../controllers/ModuleController");

const Joi = require("joi");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await getAllModules();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/:id", async (req, res) => {
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
    res.status(422).send("The given id is invalid");
  }
});

router.post("/", [auth, imagesUpload], async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(422).send("No file was selected");
    return;
  } else {
    if (!req.files.foreground_image) {
      res.status(422).send("No Foreground image file was selected");
      return;
    }

    if (!req.files.background_image) {
      res.status(422).send("No Background image file was selected");
      return;
    }
  }
  const host = req.hostname;

  //remove the port later
  const filePath =
    req.protocol + "://" + host + ":5000" + "/public/module_images/";

  let moduleFields = req.body;
  moduleFields.foreground_image =
    filePath + req.files.foreground_image[0].filename;
  moduleFields.background_image =
    filePath + req.files.background_image[0].filename;

  try {
    //we add the creator of the course and create the module
    moduleFields.creator = req.user._id;
    const result = await addModule(moduleFields);

    res.status(201).send({
      message: "Successfully added module",
      data: result,
    });
  } catch (err) {
    res.status(err.code).send({ error: err.error });
  }
});

router.put("/:id", [auth, imagesUpload], async (req, res) => {
  const { error } = Joi.string().min(1).validate(req.params.id);

  if (!error) {
    try {
      const host = req.hostname;

      //remove the port later
      const filePath =
        req.protocol + "://" + host + ":5000" + "/public/module_images/";
      let updateFields = req.body;

      console.log(updateFields, req.files, req.params.id);

      if (req.files && req.files.foreground_image) {
        updateFields.foreground_image =
          filePath + req.files.foreground_image[0].filename;
      }
      if (req.files && req.files.background_image) {
        updateFields.background_image =
          filePath + req.files.background_image[0].filename;
      }
      const result = await updateModule(req.params.id, updateFields);
      res.send({
        message: "successfully updated module",
        data: result,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  } else res.status(422).send("The id sent was invalid");
});

router.delete("/:id", async (req, res) => {
  const { error } = Joi.string().min(1).validate(req.params.id);

  if (!error) {
    try {
      const result = await deleteModule(req.params.id);
      res.send({
        message: "successfully deleted module",
        deleted_data: result,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  } else res.status(422).send("The id sent was invalid");
});

module.exports = router;
