'use strict';
const funds = require('../fund.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Funds',
      funds.map((fund) => {
        fund.createdAt = fund.updatedAt = new Date();
        return fund;
      })
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Funds', null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
