const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');

module.exports = router = (app) => {
  app.use(authRoutes);
  app.use(userRoutes);
}
