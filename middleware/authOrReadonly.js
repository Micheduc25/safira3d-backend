const jwt = require("jsonwebtoken");
// const config = require("config");
module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");

  if (token && token.toLowerCase().includes("bearer "))
    token = token.replace("bearer ", "").replace("Bearer ", "");

  if (!token) {
    req.user = null;
    next();
  } else {
    try {
      //    we attempt to decode the obtained token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (err) {
      req.user=null;
      next();
    }
  }
};
