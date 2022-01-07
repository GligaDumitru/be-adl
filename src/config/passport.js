const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./getEnv");
const tokenTypes = require("./token.type");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        httpStatus[httpStatus.FORBIDDEN]
      );
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
