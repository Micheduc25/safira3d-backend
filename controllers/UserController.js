const { SafiraModule } = require("../models/SafiraModule");
const { User, validateUpdateUser, validateUser } = require("../models/User");
const bcrypt = require("bcrypt"); //  used to hash password

const path = require("path");
const fs = require('fs');

const multer = require("multer");
const Joi = require("joi");

//we define the path where the images will be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatars");
  },
  filename: (req, file, cb) => {
    console.log("detemining file name======>",file);
    cb(null, "avatar-"+req.user._id + path.extname(file.originalname));
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

  else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const avatarUpload = upload.single('avatar');

// const updatesUpload = upload.fields([{name:avatar, maxCount:1},])

async function addUser(userData) {
  return new Promise(async (resolve, reject) => {
    const { error } = validateUser(userData);

    if (error) reject({ code: 400, error: error.details[0].message });
    else {
      const user = await User.findOne({ email: userData.email });
      if (user) reject({ code: 400, error: "Un utilisateur avec cette addresse existe déjà" });
      else {
        const salt = await bcrypt.genSalt(10); //    generates a certain random string to make cracking harder
        //  we then hash the password with the hash method of bcrypt
        const hash = await bcrypt.hash(userData.password, salt);
        userData.password = hash;
        const newUser = new User({
          ...userData,
        });

        newUser
          .save()
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject({ code: 500, error: err });
          });
      }
    }
  });
}

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    User.find()
      .select({ password: 0, __v: 0 })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject({ code: 500, error: err }));
  });
}

async function getUser(id) {
  return new Promise((resolve, reject) => {
    User.findById(id)
      .select({ password: 0, __v: 0 })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject({ code: 500, error: err }));
  });
}

async function updateUser(id, updateData) {
  const { error } = validateUpdateUser(updateData);

  return new Promise((resolve, reject) => {
    if (error) reject({ code: 400, error: error.details[0].message });
    else {
      User.findByIdAndUpdate(
        id,
        
        {
          $set: updateData,
          
        },
        {
          new: true,
          
        },
        
      )
        .select({ password: 0, __v: 0 })
        .then((res) => resolve(res))
        .catch(async(err) => {
          
          try{
            await fs.unlink("public/avatars/"+path.basename(updateData.avatar));
            print("avatar deleted");
          }
          catch(err){
            reject({ code: 500, error: err });
          }
          reject({ code: 500, error: err })
        
        }
        
        );
    }
  });
}

async function deleteUser(id) {
  return new Promise((resolve, reject) => {
    User.findByIdAndRemove(id)
      .select({ password: 0, __v: 0 })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject({ code: 500, error: err }));
  });
}

exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.avatarUpload = avatarUpload;
