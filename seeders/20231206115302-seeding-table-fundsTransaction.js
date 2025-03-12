'use strict';
const mutualFundTransactions = require('../fundTransaction.json');
const uuid4 = require('../helpers/uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      'MutualFundTransactions',
      mutualFundTransactions.map((e) => {
        e.TransactionId = uuid4();
        e.createdAt = e.updatedAt = new Date();
        return e;
      })
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('MutualFundTransactions', null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
