const mongoose = require("mongoose");
const config = require("config");
function connectDB() {
  mongoose
    .connect(process.env.MONGODB_URI || config.get("db_url"), {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("connected to MongoDB");
    })
    .catch((err) => {
      console.error("OOps could not connect to mongodb", err);
    });
}

function closeDB() {
  mongoose.disconnect();
}

exports.connectDB = connectDB;
exports.closeDB = closeDB;
