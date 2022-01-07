const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { roles } = require("../config/roles");
const toJSON = require("./plugins/toJSON.plugin");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin, to remove this field
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    username: {
      type: String,
      default: "username",
    },
    imageLink: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    position: {
      type: String,
      default: "employee",
    },
    address: {
      type: String,
      default: "-",
    },
    city: {
      type: String,
      default: "-",
    },
    country: {
      type: String,
      default: "-",
    },
    postalCode: {
      type: String,
      default: "-",
    },
    description: {
      type: String,
      default: "-",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);

/**
 *
 * @param {string} email // User Email
 * @param {ObjectId} excludeUserId // If you want to exclude an Id
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({
    email,
    _id: { $ne: excludeUserId }, // not equal to that id
  });

  // check is user already exist in DB
  return !!user;
};

const isPasswordMatchingFn = async function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 *
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatching = isPasswordMatchingFn;

const userPreSaveHook = async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
};

// Encrypt pasword before saving the document
userSchema.pre("save", userPreSaveHook);

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  userPreSaveHook,
  isPasswordMatchingFn,
};
