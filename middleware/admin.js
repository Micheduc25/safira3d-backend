module.exports = function (req, res, next) {
  //403 stands for forbidden
  if (req.user.role !== "admin") return res.status(403).send("Access denied!");
  next();
};
