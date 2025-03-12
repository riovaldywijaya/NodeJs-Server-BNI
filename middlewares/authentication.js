const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

const authentication = async (req, res, next) => {
  try {
    let payload = verifyToken(req.headers.access_token);

    if (!payload) throw { name: 'Unauthenticated' };

    const findUser = await User.findByPk(payload.id);
    if (!findUser) throw { name: 'Unauthenticated' };

    req.user = {
      id: findUser.id,
      email: findUser.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
