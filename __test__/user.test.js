const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { signToken } = require('../helpers/jwt');
const { User } = require('../models');
let access_token = '';

beforeAll(async () => {
  try {
    const user = await User.create({
      email: 'user1@mail.com',
      password: '12345',
      fullName: 'Riovaldy Wijaya',
      totalAsset: 0,
      profit: 0,
    });

    access_token = signToken({ id: user.id, email: user.email });
    console.log('<<<<<<<<<<<<<<<<<<<<<< INI JALAN');
  } catch (err) {
    console.log(err, '<<<<<<<<<<<<<<<<<<<<<< error in beforeAll');
  }
});

afterAll(async () => {
  try {
    await sequelize.queryInterface.bulkDelete('Users', null, {
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (err) {
    console.log(err, '<<<<<<<<< error in afterAll');
  }
});

describe('POST /login - user login', () => {
  try {
    it('should return access_token - 200 Success login', async () => {
      const user1 = {
        email: 'user1@mail.com',
        password: '12345',
      };

      const response = await request(app).post('/login').send(user1);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('access_token', expect.any(String));
      expect(response.body.data).toHaveProperty('name', expect.any(String));
      expect(response.body.data).toHaveProperty('profit', expect.any(String));
      expect(response.body.data).toHaveProperty('totalAsset', expect.any(String));
    });

    it('should fail if email not found in database', async () => {
      const user1 = {
        email: 'user1@mail.com',
        password: 'wrongPassword',
      };
      const response = await request(app).post('/login').send(user1);

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message', 'Email/Password is invalid');
    });
  } catch (error) {
    console.log(error, '<<<<<<< error from catch');
  }
});
