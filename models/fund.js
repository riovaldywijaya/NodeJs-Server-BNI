'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Fund.hasMany(models.MutualFundTransaction, { foreignKey: 'FundId' });
      Fund.hasMany(models.UserMutualFund, { foreignKey: 'FundId' });
    }
  }
  Fund.init(
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      nav: DataTypes.DECIMAL,
      rating: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'Fund',
    }
  );
  return Fund;
};
