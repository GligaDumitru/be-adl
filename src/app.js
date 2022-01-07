const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors");
const xss = require("xss-clean");
const httpStatus = require("http-status");
const config = require("./config/getEnv");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const routes = require("./routes/v1");
const mongoSanitize = require("express-mongo-sanitize");
const ApiError = require("./utils/ApiError");

const {
  errorHandler,
  convertToErrorMiddleware,
} = require("./middlewares/error");
const logger = require("./config/logger");

const app = express();

// check requests logger
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// add security HTTP headers
app.use(helmet());

// parse JSON body req
app.use(express.json());

// parse URLEncoded body req
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

app.use(cors());
app.options("*", cors());

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.get("/", (req, res) => {
  res.send({
    message: "Welcome",
  });
});

app.use("/v1", routes);

app.use((_, __, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Route Not Found"));
});

// if needed convert to standar erro by ApiError with statusCode and message
app.use(convertToErrorMiddleware);

app.use(errorHandler);

module.exports = app;
