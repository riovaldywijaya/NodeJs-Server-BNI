let jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (payload) => {
  let token = jwt.sign(payload, JWT_SECRET);
  return token;
};

const verifyToken = (token) => {
  var decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
};

module.exports = { signToken, verifyToken };
