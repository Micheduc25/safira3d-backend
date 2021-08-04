const {
  SafiraModule,
  validateModule,
  validateUpdateModule,
} = require("../models/SafiraModule");

const path = require("path");

const multer = require("multer");
const Joi = require("joi");
const { Rating, validateRating } = require("../models/Rating");

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
  }

  // else if (req) {

  // }
  else {
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

//we will use the userId to know how to recommend modules to users
async function getAllModules(userId) {
  return new Promise((resolve, reject) => {
    SafiraModule.find()
      .populate("creator", "-password -__v")
      .sort({ date: -1 }) //TODO: return modules according to user's preferences in future
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

async function deleteModule(id, currUser) {
  return new Promise(async (resolve, reject) => {
    /* we find all ratings related to this module and
     we delete them before deleting the module itself */

    try {
      const module = await SafiraModule.findById(id);
      if (
        module &&
        (module.creator.toString() === currUser._id ||
          currUser.role === "admin")
      ) {
        await Rating.deleteMany({ moduleId: id });

        await module.deleteOne();

        //TODO: delete associated module images oh
        resolve(module);
      } else {
        reject({ code: 403, error: "Forbidden access" });
      }
    } catch (err) {
      reject({ code: 500, error: err });
    }
  });
}

async function updateModule(id, updateData, currUser) {
  //TODO:remember to delete previous images belonging to module if a new image is added
  return new Promise(async (resolve, reject) => {
    const { error } = validateUpdateModule(updateData);

    if (!error) {
      let module;

      try {
        module = await SafiraModule.findById(id);
      } catch (err) {
        reject({ code: 400, error: "invalid module id" });
      }

      if (
        module &&
        (module.creator.toString() === currUser._id ||
          currUser.role === "admin")
      ) {
        module
          .update({
            $set: updateData,
          })
          .then((result) => resolve(result))
          .catch((err) => reject({ code: 500, error: err }));
      } else {
        reject({
          code: 403,
          error: "Forbiden access" + module.creator + " " + currUser._id,
        });
      }
    } else {
      reject({ code: 400, error: error });
    }
  });
}

async function likeModule(moduleId, likerId) {
  return new Promise(async (resolve, reject) => {
    let module;
    try {
      module = await SafiraModule.findById(moduleId);
    } catch (err) {
      reject({ code: 400, error: "The Provided Id is Invalid" });
    }

    if (module) {
      if (module.likers.includes(likerId)) {
        reject({ code: 400, error: "User has already liked this module" });
      } else {
        try {
          await SafiraModule.updateOne(
            { _id: module._id },
            {
              $inc: {
                likes: 1,
              },
              $push: {
                likers: likerId,
              },
            }
          );

          resolve({ code: 200, message: "successfully liked module!" });
        } catch (err) {
          reject({ code: 500, error: err });
        }
      }
    } else {
      reject({ code: 400, error: "The Module was not found" });
    }
  });
}

async function unlikeModule(moduleId, likerId) {
  return new Promise(async (resolve, reject) => {
    let module;
    try {
      module = await SafiraModule.findById(moduleId);
    } catch (err) {
      reject({ code: 400, error: "The Provided Id is Invalid" });
    }

    if (module) {
      if (!module.likers.includes(likerId)) {
        reject({ code: 400, error: "User has not liked this module" });
      } else {
        try {
          await SafiraModule.updateOne(
            { _id: module._id },
            {
              $inc: {
                likes: -1,
              },
              $pull: {
                likers: likerId,
              },
            }
          );

          resolve({ code: 200, message: "successfully unliked module!" });
        } catch (err) {
          reject({ code: 500, error: err });
        }
      }
    } else {
      reject({ code: 404, error: "The Module was not found" });
    }
  });
}

async function viewModule(moduleId, viewerId) {
  return new Promise(async (resolve, reject) => {
    let module;
    try {
      module = await SafiraModule.findById(moduleId);
    } catch (err) {
      reject({ code: 400, error: "The Provided Id is Invalid" });
    }

    if (module) {
      if (module.viewers.includes(viewerId)) {
        reject({ code: 400, error: "User has already viewed this module" });
      } else {
        try {
          await SafiraModule.updateOne(
            { _id: module._id },
            {
              $inc: {
                views: 1,
              },
              $push: {
                viewers: viewerId,
              },
            }
          );

          resolve({ code: 200, message: "successfully viewed module!" });
        } catch (err) {
          reject({ code: 500, error: err });
        }
      }
    } else {
      reject({ code: 404, error: "The Module was not found" });
    }
  });
}

//function to rate a module
async function rateModule(moduleId, raterId, value) {
  //we check if the given value is valid
  let floatValue;
  try {
    floatValue = parseFloat(value);
  } catch (err) {
    throw { code: 400, error: "An invalid rating value was given" };
  }
  const { error } = validateRating({
    value: floatValue,
    raterId: raterId,
    moduleId: moduleId,
  });

  if (error) throw { code: 400, error: error.details[0].message };

  return new Promise(async (resolve, reject) => {
    //we now try to fetch the module calculate the new average rating and update the module
    let module;

    //we findout if the user has already rated the said module
    let existingRating;
    try {
      existingRating = await Rating.findOne({
        raterId: raterId,
        moduleId: moduleId,
      });
    } catch (err) {
      reject({ code: 400, error: err });
      return;
    }

    //we fetch the said module;
    try {
      module = await SafiraModule.findById(moduleId);
    } catch (err) {
      reject({ code: 400, error: "Invalid module Id" });
      return;
    }

    if (module) {
      //if the rating document for this user and module already exist we just update it
      //else we create a new rating document from the given values and save it.
      if (existingRating) {
        existingRating.value = floatValue;
        existingRating.date = Date.now();
        await existingRating.save();
      } else {
        const rating = new Rating({
          value: floatValue,
          raterId: raterId,
          moduleId: moduleId,
        });

        await rating.save();
      }
      //  we find all the ratings for this module and attempt to calculate the average
      const allModuleRatings = await Rating.find({ moduleId: moduleId });
      let i = 0;
      let sum = 0;
      while (i < allModuleRatings.length) {
        sum += allModuleRatings[i].value;
        i++;
      }
      //we make sure there is no division by zero error
      const divider = allModuleRatings.length || 1;

      const averageRating = Math.round(sum / divider);

      const session = await SafiraModule.startSession();

     try{ 

     const result =  await session.withTransaction(
        ()=>{
          return new Promise(async(resolve,reject)=>{
            try {
              module.rating = averageRating;
              if (!module.raters.includes(raterId)) module.raters.push(raterId);
              await module.save();
      
              resolve({ _id: module._id, new_rating: averageRating });
            } catch (err) {
              reject({ code: 500, error: err });
            }
          })
        }
        
        )

        resolve(result);

      }
      catch(err){
        reject({code:err.code,error:err.error});
      }
      finally{
        session.endSession();
      }
        

    } else {
      reject({ code: 404, error: "The module was not found" });
    }
  });
}

exports.getAllModules = getAllModules;
exports.getModule = getModule;
exports.addModule = addModule;
exports.deleteModule = deleteModule;
exports.updateModule = updateModule;
exports.imagesUpload = imagesUpload;
exports.likeModule = likeModule;
exports.unlikeModule = unlikeModule;
exports.viewModule = viewModule;
exports.rateModule = rateModule;
