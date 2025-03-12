'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MutualFundTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MutualFundTransaction.belongsTo(models.Fund, { foreignKey: 'FundId' });
      MutualFundTransaction.belongsTo(models.User, { foreignKey: 'UserId' });
    }
  }
  MutualFundTransaction.init(
    {
      TransactionId: DataTypes.UUID,
      FundId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      transactionType: DataTypes.STRING,
      units: DataTypes.DECIMAL,
      amount: DataTypes.DECIMAL,
      nav: DataTypes.DECIMAL,
      fees: DataTypes.DECIMAL,
      tax: DataTypes.DECIMAL,
      totalAmount: DataTypes.DECIMAL,
      status: {
        type: DataTypes.STRING,
        defaultValue: 'waiting',
      },
      midtransToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'MutualFundTransaction',
    }
  );
  return MutualFundTransaction;
};
