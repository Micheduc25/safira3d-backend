const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");

  if (token && token.toLowerCase().includes("bearer "))
    token = token.replace("bearer ", "").replace("Bearer ", "");

  if (!token) return res.status(401).send("Access denied! No token provided");

  try {
    //    we attempt to decode the obtained token
    const decoded = jwt.verify(token, config.get("jwtSecretKey"));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};
