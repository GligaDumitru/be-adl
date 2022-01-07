const router = require("express").Router();
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const docsRoute = require('./docs.route');
const config = require('../../config/getEnv');

const routes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
];

const developmentRoutes = [
  {
    path: "/docs",
    route: docsRoute
  }
]

routes.forEach(({ path, route }) => {
  router.use(path, route);
});

if(config.env === 'development') {
  developmentRoutes.forEach(({ path, route }) => {
    router.use(path, route);
  })
}

module.exports = router;
