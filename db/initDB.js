const mongoose = require("mongoose");
// const config = require("config");
function connectDB() {
  mongoose
    .connect(process.env.DB_URL, {
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
