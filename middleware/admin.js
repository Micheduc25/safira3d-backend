const { User } = require("../models/User");
module.exports = async function (req, res, next) {
  //403 stands for forbidden
  if (req.user) {
    try {
      const user = await User.findOne({ _id: req.user._id });
      if (user && user.role === "admin") next();
      else res.status(401).send("Accès refusé");
    } catch (err) {
      console.error(err);
      res.status(500).send("Une erreur inconnue s'est produite");
    }
  }else res.status(401).send("Access denied");
};
