const Joi = require("joi");
const { customPasswordValidation, objectId } = require("./custom.validation");
const { roles } = require("../config/roles");

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(customPasswordValidation),
    name: Joi.string().required(),
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

const updateUserRole = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limmit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().custom(customPasswordValidation),
    name: Joi.string(),
    username: Joi.string(),
    imageLink: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    postalCode: Joi.string(),
    description: Joi.string(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
};
