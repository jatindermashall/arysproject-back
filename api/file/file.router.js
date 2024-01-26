const router = require("express").Router();

const { upload, uploadpdf } = require("./file.controller");

const singleUpload = upload.single("image");
const singleUploadpdf = uploadpdf.single("pdf");

router.post("/upload", function (req, res) {
  console.log("region", process.env.AWS_REGION_MYAPP);
  singleUpload(req, res, function (err) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({
        success: 1,
        data: {
          files: {
            location: req.file.location,
          },
        },
      });
    }
  });
});

router.post("/uploadpdf", function (req, res) {
  console.log(req);
  singleUploadpdf(req, res, function (err) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({
        success: 1,
        data: {
          files: {
            location: req.file.location,
          },
        },
      });
    }
  });
});

module.exports = router;
