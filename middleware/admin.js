module.exports = function (req, res, next) {
  //403 stands for forbidden
  if (req.user.role !== "admin") return res.status(401).send(`Access denied user is a ${req.user.role}!`);
  next();
};
