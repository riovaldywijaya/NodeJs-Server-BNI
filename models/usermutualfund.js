'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserMutualFund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserMutualFund.belongsTo(models.User, { foreignKey: 'UserId' });
      UserMutualFund.belongsTo(models.Fund, { foreignKey: 'FundId' });
    }
  }
  UserMutualFund.init(
    {
      UserId: DataTypes.INTEGER,
      FundId: DataTypes.INTEGER,
      totalUnit: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'UserMutualFund',
    }
  );
  return UserMutualFund;
};
