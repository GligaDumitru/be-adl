const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create user
 * @param {Object} user
 * @returns {Promise<User>}
 */
const createUser = async (user) => {
  if (await User.isEmailTaken(user.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(user);
};

/**
 * Gel All Users
 * @returns {Promise<User>}
 */
const getUsers = async () => {
  const users = await User.find({});
  return users;
};

/**
 * Get User by ID
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get User By Email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updatedBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updatedBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }
  if (updatedBody.email) {
    const checkIfEmailAlreadyExists = await User.isEmailTaken(
      updatedBody.email,
      userId
    );
    if (checkIfEmailAlreadyExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
  }
  Object.assign(user, updatedBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById
};
