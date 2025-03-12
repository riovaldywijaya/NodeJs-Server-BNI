'use strict';
const userMutualFunds = require('../userMutualFunds.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'UserMutualFunds',
      userMutualFunds.map((fund) => {
        fund.createdAt = fund.updatedAt = new Date();
        return fund;
      })
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserMutualFunds', null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
