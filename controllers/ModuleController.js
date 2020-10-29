const {
  SafiraModule,
  validateModule,
  validateUpdateModule,
} = require("../models/SafiraModule");

const path = require("path");

const multer = require("multer");

//we define the path where the images will be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/module_images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const imagesUpload = upload.fields([
  {
    name: "foreground_image",
    maxCount: 1,
  },
  {
    name: "background_image",
    maxCount: 1,
  },
]);
async function getAllModules() {
  return new Promise((resolve, reject) => {
    SafiraModule.find()
      .populate("creator", "-password -__v")
      .sort({ date: -1 })
      .select({ __v: 0 })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => reject(err));
  });
}

async function getModule(id) {
  return new Promise((resolve, reject) => {
    SafiraModule.findById(id)
      .populate("creator", "-password -__v")
      .select({ __v: 0 })
      .then((document) => {
        resolve(document);
      })
      .catch((err) => reject(err));
  });
}

async function addModule(moduleData) {
  const { error } = validateModule(moduleData);
  if (!error) {
    //we check if a module with the given name already exists
    const mod = await SafiraModule.findOne({ title: moduleData.title });
    if (mod) {
      throw {
        code: 400,
        error: `Module "${moduleData.title}" already exists!`,
      };
    } else {
      try {
        const safiraModule = new SafiraModule({
          ...moduleData,
        });

        const mod = await safiraModule.save();
        return mod;
      } catch (err) {
        throw { code: 500, error: error };
      }
    }
  } else throw { code: 400, error: error.details[0].message };
}

async function deleteModule(id) {
  return new Promise((resolve, reject) => {
    SafiraModule.findByIdAndRemove(id)
      .then((doc) => resolve(doc))
      .catch((err) => reject(err));
  });
}

async function updateModule(id, updateData) {
  //TODO:remember to delete previous images belonging to module if a new image is added
  return new Promise((resolve, reject) => {
    const { error } = validateUpdateModule(updateData);

    if (!error) {
      SafiraModule.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        { new: true }
      )
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    } else {
      reject(error);
    }
  });
}

exports.getAllModules = getAllModules;
exports.getModule = getModule;
exports.addModule = addModule;
exports.deleteModule = deleteModule;
exports.updateModule = updateModule;
exports.imagesUpload = imagesUpload;
