const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/image", (req, res) => {
  let fileUrl;
  try {
    fileUrl = req.query.file_url.split("public")[1];
  } catch (err) {
    res.status(400).send({ error: err });
  }

    if (fileUrl) {
      
    var file = __dirname.split('routes')[0] + "/public" + fileUrl;
    const filename = path.basename(file);
    res.setHeader("Content-disposition", "attachment; filename=" + filename);
    res.setHeader("Content-type", "image/png");

    const fileStream = fs.createReadStream(file);
    fileStream.pipe(res);
  }
});

router.get('/module/:id', (req, res) => { 
    let fileUrl;
    try {
      fileUrl = req.query.file_url.split("public")[1];
    } catch (err) {
      res.status(400).send({ error: err });
    }

    if (fileUrl) {
      var file = __dirname.split("routes")[0] + "/public" + fileUrl;
      const filename = path.basename(file);
      res.setHeader("Content-disposition", "attachment; filename=" + filename);
      res.setHeader("Content-type", "image/png");

      const fileStream = fs.createReadStream(file);
      fileStream.pipe(res);
    }
});

module.exports = router;
