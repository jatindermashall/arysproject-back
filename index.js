require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const userRouter = require("./api/users/user.router");
const monRouter = require("./api/mon/mon.router");

const fileRouter = require("./api/file/file.router");

const clusters = require("cluster");
const allowedOrigins = ["http://localhost:3000", "https://example.com"];

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
//app.use(express.static(path.join(__dirname, "./client/out")))
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/users", userRouter);

app.use("/api/files", fileRouter);
app.use("/api/mon", monRouter);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to IK API");
});

// 404 route.
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// error handler
const errorHandler = require("./api/error/handleError");
app.use(errorHandler);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});
clusters.on("death", function (worker) {
  app.listen(3000);
});
