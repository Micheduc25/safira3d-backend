const { SafiraModule } = require("../models/SafiraModule");
const { User, validateUpdateUser, validateUser } = require("../models/User");
const bcrypt = require("bcrypt"); //  used to hash password

async function addUser(userData) {
  return new Promise(async (resolve, reject) => {
    const { error } = validateUser(userData);

    if (error) reject({ code: 400, error: error.details[0].message });
    else {
      const user = await User.findOne({ email: userData.email });
      if (user) reject({ code: 500, error: "User already exists" });
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
        }
      )
        .select({ password: 0, __v: 0 })
        .then((res) => resolve(res))
        .catch((err) => reject({ code: 500, error: err }));
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
