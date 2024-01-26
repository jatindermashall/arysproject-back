const jwt = require("jsonwebtoken");

module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get("authorization");

    //console.warn(token);
    //console.warn(process.env.JWT_SECRET_KEY);
    if (token) {
      // Remove Bearer from string

      token = token.slice(7);
      //console.warn(token);
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.json({
            success: 0,
            message: "Invalid Token...",
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: 0,
        message: "Access Denied! Unauthorized User",
      });
    }
  },

  checkToken2: (req, res, next) => {
    let token = req.get("authorization");
    let tokenstored = "bFpW1Lnonkd9fmoCMXDOWMpEIanPe7Jz";

    //console.warn(token);
    //console.warn(process.env.JWT_SECRET_KEY);
    if (token) {
      // Remove Bearer from string

      //console.warn(token);
      if (token == tokenstored) {
        next();
      }
    } else {
      return res.json({
        success: 0,
        message: "Access Denied! Unauthorized User",
      });
    }
  },
};
