module.exports = (err, req, res, next) => {
  console.log(err.message);

  if (err.myErr) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // res.status(500).json({
    //   success: false,
    //   message: "Something went wrong",
    // });

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
