const mongoose = require("mongoose");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const config = require("../config/getEnv");
const logger = require("../config/logger");

const convertToErrorMiddleware = (err, req, res, next) => {
  let error = err;
  const isInstanceOfApiError = error instanceof ApiError;
  const isInstanceOfMongooseError = error instanceof mongoose.Error;

  // convert to ApiError with statusCode and message
  if (!isInstanceOfApiError) {
    const statusCode = error.statusCode
      ? error.statusCode
      : error instanceof mongoose.Error
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;

    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors } = err;

  // in case there is not a statusCode or a messge
  if (!statusCode) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }
  if (!message) {
    message = httpStatus[statusCode];
  }

  // use this for morgan to send message
  res.locals.errorMessage = message;

  const response = {
    code: statusCode,
    message,
    ...(errors && errors.length > 0 && {errors}),
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  convertToErrorMiddleware,
  errorHandler,
};
