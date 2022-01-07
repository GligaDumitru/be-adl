const { version } = require("../../package.json");
const config = require("../config/getEnv");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Multistrat App Node Express MongoDB",
    version,
    license: {
      name: "MIT",
      url: "https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
