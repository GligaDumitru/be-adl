const _ = require("lodash");
const Joi = require("joi");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const validate = (schema) => (req, res, next) => {
  // get obj with what is needed to validate
  const validSchema = _.pick(schema, ["params", "query", "body"]);
  // get from req the values to be validated
  const object = _.pick(req, Object.keys(validSchema));
  // validate via Joi
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  // check for error
  if (error) {
    const errors = error.details.map((details) => details.message);
    return next(
      new ApiError(
        httpStatus.BAD_REQUEST,
        httpStatus[httpStatus.BAD_REQUEST],
        errors
      )
    );
  }

  // Add value to req to have access
  Object.assign(req, value);
  return next();
};

module.exports = validate;
