'use strict';
const { hashPassword } = require('../helpers/bcrypt');
const users = require('../user.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Users',
      users.map((user) => {
        user.password = hashPassword(user.password);
        user.createdAt = user.updatedAt = new Date();
        return user;
      })
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
