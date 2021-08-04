const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const modulesRouter = require("./routes/modules");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const visiteRouter = require("./routes/visites");
const downloadRouter = require("./routes/download");
const db = require("./db/initDB");
const path = require("path");
const config = require("config");
const cors = require('cors');
require("dotenv").config();
const app = express();
const multer = require("multer");

const { connectDB } = require("./db/initDB");
const { json } = require("body-parser");
if (!config.get("jwtSecretKey")) {
  //if our jwt secret key is not set we exit the application
  console.error("FATAL ERROR JWT KEY NOT SET!");
  process.exit(1);
}

//we set allowed cors urls here
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 
}
//middleware
app.use(express.json({
  type:['application/json','text/plain']
}));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(helmet());
app.use(cors());

app.use(express.urlencoded({
  extended: true
}));

const upload = multer();
app.use(upload.any() );

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//  routes here
app.use("/api/modules", modulesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/download", downloadRouter);
app.use("/public/visites", visiteRouter);

// db.connectDB();

connectDB();

//start listening here
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("server running at ", port);
});
