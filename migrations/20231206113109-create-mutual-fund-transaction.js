'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MutualFundTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      TransactionId: {
        type: Sequelize.UUID,
      },
      FundId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Funds',
          key: 'id',
        },
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      date: {
        type: Sequelize.DATE,
      },
      transactionType: {
        type: Sequelize.STRING(50),
      },
      units: {
        type: Sequelize.DECIMAL(12, 4),
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
      },
      nav: {
        type: Sequelize.DECIMAL(12, 4),
      },
      fees: {
        type: Sequelize.DECIMAL(12, 2),
      },
      tax: {
        type: Sequelize.DECIMAL(12, 2),
      },
      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
      },
      status: {
        type: Sequelize.STRING(10),
        defaultValue: 'waiting',
      },
      midtransToken: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MutualFundTransactions');
  },
};
