const authMiddleware = require('./authMiddleware');
const signupMiddleware = require('./signupMiddleware');
const loginController = require('./loginController');
const utils = require('./utils');

module.exports = {
  ...authMiddleware,
  ...signupMiddleware,
  ...loginController,
  utils
};
