const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const modulesRouter = require("./routes/modules");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const visiteRouter = require("./routes/visites");
const downloadRouter = require("./routes/download");
// const db = require("./db/initDB");
const path = require("path");
// const config = require("config");
const cors = require('cors');
const app = express();
const config = require('config');

const { connectDB } = require("./db/initDB");
// const { config } = require("dotenv");

if (!process.env.JWT_SECRET_KEY|| !process.env.DB_URL|| !process.env.MAIL_PASSWORD||!process.env.PORT) {
 //if our environment variables are not well set we exit the app
  console.error("FATAL ERROR ALL ENV VARIABLES ARE NOT SET!");
  process.exit(1);
}
console.log(config.get("allowedHosts"));
//we set allowed cors urls here
const corsOptions = {
  origin: config.get("allowedHosts"),
  optionsSuccessStatus: 200 
}
//middleware
app.use(express.json({
  type:['application/json','text/plain']
}));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.urlencoded({
  extended: true
}));

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
}

app.get("/", (req, res) => {
  res.send("Safira3d!");
});

//  routes here
app.use("/api/modules", modulesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/download", downloadRouter);
app.use("/public/visites", visiteRouter);
connectDB();

//start listening here
const port = process.env.PORT;
app.listen(port, () => {
  console.log("server running at ", port);
});
