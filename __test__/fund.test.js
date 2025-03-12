const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const users = require('../user.json');
const funds = require('../fund.json');
const mutualFundTransactions = require('../fundTransaction.json');
const { hashPassword } = require('../helpers/bcrypt');
const uuid4 = require('../helpers/uuid');
const { User } = require('../models');
const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyMUBtYWlsLmNvbSIsImlhdCI6MTcwMjA0MTQzMX0.B0qXOovrX3OMWozJ7CYweIF-bvtQTsZ2PFNq__c0LAM';

beforeAll(async () => {
  try {
    await sequelize.queryInterface.bulkInsert(
      'Users',
      users.map((user) => {
        user.password = hashPassword(user.password);
        user.createdAt = user.updatedAt = new Date();
        return user;
      })
    );

    await sequelize.queryInterface.bulkInsert(
      'Funds',
      funds.map((fund) => {
        fund.createdAt = fund.updatedAt = new Date();
        return fund;
      })
    );

    await sequelize.queryInterface.bulkInsert(
      'MutualFundTransactions',
      mutualFundTransactions.map((e) => {
        e.TransactionId = uuid4();
        e.createdAt = e.updatedAt = new Date();
        return e;
      })
    );

    console.log('<<<<<<<<<<<<<<<<<<<<<< INI JALAN');
  } catch (err) {
    console.log(err, '<<<<<<<<<<<<<<<<<<<<<< error in beforeAll');
  }
});

afterAll(async () => {
  try {
    await sequelize.queryInterface.bulkDelete('Users', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });

    await sequelize.queryInterface.bulkDelete('Funds', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });

    await sequelize.queryInterface.bulkDelete('MutualFundTransactions', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  } catch (err) {
    console.log(err, '<<<<<<<<< error in afterAll');
  }
});

describe('GET /funds - get all funds with authentication', () => {
  try {
    it('should return all funds with status 200', async () => {
      const response = await request(app).get('/funds').set('access_token', access_token);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', expect.any(Number));
      expect(response.body[0]).toHaveProperty('name', expect.any(String));
      expect(response.body[0]).toHaveProperty('type', expect.any(String));
      expect(response.body[0]).toHaveProperty('nav', expect.any(String));
      expect(response.body[0]).toHaveProperty('rating', expect.any(String));
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }
});

describe('POST /funds/buy-sell - buy or sell fund with authentication', () => {
  try {
    it('should return message success buy with status 201', async () => {
      const body = {
        fundId: 1,
        units: 10,
        amount: 10000,
        transactionType: 'buy',
      };

      const response = await request(app).post('/funds/buy-sell').send(body).set('access_token', access_token);
      const findUser = await User.findOne({ where: { email: 'user1@mail.com' } });

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Mutual fund buy successful');
      expect(findUser).toHaveProperty('totalAsset', 10000);
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }

  try {
    it('should return message success sell with status 201', async () => {
      const body = {
        fundId: 1,
        units: 10,
        amount: 10000,
        transactionType: 'sell',
      };

      const response = await request(app).post('/funds/buy-sell').send(body).set('access_token', access_token);
      const findUser = await User.findOne({ where: { email: 'user1@mail.com' } });

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Mutual fund sell successful');
      expect(findUser).toHaveProperty('totalAsset', 0);
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }

  try {
    it('should fail if fund not found with status 404', async () => {
      const body = {
        fundId: 10,
        units: 10,
        amount: 10000,
        transactionType: 'sell',
      };

      const response = await request(app).post('/funds/buy-sell').send(body).set('access_token', access_token);

      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Fund not found');
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }
});

describe('POST /funds/switch - switch fund with authentication', () => {
  try {
    it('should return message success switch with status 201', async () => {
      const body = {
        sourceFundId: 1,
        targetFundId: 2,
        units: 50,
      };

      const response = await request(app).post('/funds/switch').send(body).set('access_token', access_token);

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Mutual fund switch successful');
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }

  try {
    it('should fail if fund not found with status 404', async () => {
      const body = {
        sourceFundId: 10,
        targetFundId: 2,
        units: 50,
      };

      const response = await request(app).post('/funds/switch').send(body).set('access_token', access_token);

      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Fund not found');
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }
});

describe('GET /pub/funds - get all funds without authentication', () => {
  try {
    it('should return all funds with status 200', async () => {
      const response = await request(app).get('/pub/funds');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', expect.any(Number));
      expect(response.body[0]).toHaveProperty('name', expect.any(String));
      expect(response.body[0]).toHaveProperty('type', expect.any(String));
      expect(response.body[0]).toHaveProperty('nav', expect.any(String));
      expect(response.body[0]).toHaveProperty('rating', expect.any(String));
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }
});
