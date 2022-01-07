const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

// create schema to validate
const getEnvSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("production", "development", "test"),
    PORT: Joi.number().default(5000),
    MONGODB_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
  })
  .unknown();

const validateSchema = getEnvSchema.validate(process.env);

const { value: getEnvVars, error } = validateSchema;

if (error) {
  throw new Error(`ERROR: Validation .env failed with error: ${error.message}`);
}

module.exports = {
  env: getEnvVars.NODE_ENV,
  port: getEnvVars.PORT,
  mongoose: {
    url:
      getEnvVars.MONGODB_URL + (getEnvVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: getEnvVars.JWT_SECRET,
    accessExpirationMinutes: getEnvVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: getEnvVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      getEnvVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes:
      getEnvVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: getEnvVars.SMTP_HOST,
      port: getEnvVars.SMTP_PORT,
      auth: {
        user: getEnvVars.SMTP_USERNAME,
        pass: getEnvVars.SMTP_PASSWORD,
      },
    },
    from: getEnvVars.EMAIL_FROM,
  },
};
