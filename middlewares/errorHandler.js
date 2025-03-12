const errorHandler = (err, req, res, next) => {
  console.log(err, '<<<<<< in error handler');
  switch (err.name) {
    case 'EmailIsNull':
      res.status(400).json({ message: 'Email is required' });
      break;
    case 'PasswordIsNull':
      res.status(400).json({ message: 'Password is required' });
      break;
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      res.status(400).json({
        message: err.errors[0].message,
      });
    case 'InvalidEmailOrPassword':
      res.status(401).json({ message: 'Email/Password is invalid' });
      break;
    case 'Unauthenticated':
    case 'JsonWebTokenError':
      res.status(401).json({ message: 'Invalid Token' });
      break;
    case 'invalidTransaction':
      res.status(401).json({ message: 'Invalid Transaction' });
      break;
    case 'FundNotFound':
      res.status(404).json({ message: 'Fund not found' });
      break;
    case 'MutualFundTransactionNotFound':
      res.status(404).json({ message: 'Mutual fund transaction not found' });
      break;
    default:
      res.status(500).json({ message: 'Internal Server Error' });
      break;
  }
};

module.exports = errorHandler;
