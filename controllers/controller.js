const { comparePassword } = require('../helpers/bcrypt');
const { authorizationUrl, oauth2Client } = require('../helpers/googleOAuth');
const { signToken } = require('../helpers/jwt');
const getTotalAsset = require('../helpers/userTotalAsset');
const uuid4 = require('../helpers/uuid');
const { User, Fund, MutualFundTransaction, UserMutualFund, sequelize } = require('../models');
const { countTax, countFees, getTransactionDate, switchUnits, getUnits } = require('../utils/transaction');
const { google } = require('googleapis');
const midtransClient = require('midtrans-client');

class Controller {
  static async userLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: 'EmailIsNull' };
      if (!password) throw { name: 'PasswordIsNull' };

      const user = await User.findOne({
        where: {
          email,
        },
        include: UserMutualFund,
      });
      if (!user) throw { name: 'InvalidEmailOrPassword' };

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) throw { name: 'InvalidEmailOrPassword' };

      const access_token = signToken({ id: user.id, email: user.email });

      const totalAsset = user.UserMutualFunds.length === 0 || !user.UserMutualFunds ? 0 : await getTotalAsset(user.UserMutualFunds, user.id);

      res.status(200).json({
        access_token,
        data: {
          name: user.fullName,
          totalAsset: `Rp.${totalAsset}`,
          profit: `Rp.${user.profit}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleRedirect(req, res, next) {
    try {
      res.redirect(authorizationUrl);
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req, res, next) {
    try {
      const { code } = req.query;

      const { tokens } = await oauth2Client.getToken(code);

      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();

      if (!data.email || !data.name) {
        return res.json({
          data: data,
        });
      }

      let user = await User.findOne({
        where: {
          email: data.email,
        },
        include: UserMutualFund,
      });

      if (!user) {
        user = await User.create(
          {
            email: data.email,
            password: 'Login By Google',
            fullName: data.name,
            totalAsset: 0,
            profit: 0,
          },
          {
            hooks: false,
          }
        );
      }

      const access_token = signToken({
        id: user.id,
        email: user.email,
      });

      let totalAsset = 0;

      if (user.UserMutualFunds) {
        totalAsset = await getTotalAsset(user.UserMutualFunds, user.id);
      } else {
        totalAsset = 0;
      }

      res.status(200).json({
        access_token,
        data: {
          name: user.fullName,
          totalAsset: `Rp.${totalAsset}`,
          profit: `Rp.${user.profit}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAllFunds(req, res, next) {
    try {
      const findFunds = await Fund.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });

      res.status(200).json(findFunds);
    } catch (error) {
      next(error);
    }
  }

  static async buyFund(req, res, next) {
    try {
      const { fundId } = req.body;
      const amount = Number(req.body.amount);
      const userId = req.user.id;

      const fund = await Fund.findByPk(fundId);
      if (!fund) throw { name: 'FundNotFound' };

      const getUserUnit = getUnits(amount, fund.nav);
      const tax = countTax(amount);
      const fees = countFees(amount);

      const transactionDate = getTransactionDate();

      const createTransaction = await MutualFundTransaction.create({
        TransactionId: uuid4(),
        UserId: userId,
        FundId: fundId,
        date: transactionDate,
        nav: fund.nav,
        transactionType: 'buy',
        units: getUserUnit,
        amount,
        fees,
        tax,
        totalAmount: amount + fees + tax,
        status: 'waiting',
      });

      res.status(201).json({
        message: 'transaction waiting for the payment',
        data: {
          TransactionId: createTransaction.TransactionId,
          transactionType: createTransaction.transactionType,
          units: createTransaction.units,
          totalAmount: createTransaction.totalAmount,
          status: createTransaction.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateMidtransToken(req, res, next) {
    try {
      const { TransactionId } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      const mutualFundTransaction = await MutualFundTransaction.findOne({
        where: {
          TransactionId,
        },
      });

      if (!mutualFundTransaction) throw { name: 'MutualFundTransactionNotFound' };
      if (user.id !== mutualFundTransaction.UserId) throw { name: 'invalidTransaction' };

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: TransactionId + '/' + Math.floor(10000 * Math.random() + 90000),
          gross_amount: mutualFundTransaction.totalAmount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: user.email,
        },
      };

      const midtransToken = await snap.createTransaction(parameter);

      await mutualFundTransaction.update(
        {
          midtransToken: midtransToken.token,
        },
        {
          where: {
            TransactionId,
          },
        }
      );

      res.status(201).json({ midtransToken });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatusPayment(req, res, next) {
    try {
      const { TransactionId } = req.body;

      const mutualFundTransaction = await MutualFundTransaction.findOne({
        where: {
          TransactionId,
        },
      });
      if (!mutualFundTransaction) throw { name: 'MutualFundTransactionNotFound' };
      if (!mutualFundTransaction.midtransToken) throw { name: 'invalidTransaction' };

      await mutualFundTransaction.update(
        {
          status: 'success',
        },
        {
          where: {
            TransactionId,
          },
        }
      );

      const userId = mutualFundTransaction.UserId;
      const fundId = mutualFundTransaction.FundId;
      const units = mutualFundTransaction.units;

      const findUserMutualFund = await UserMutualFund.findOne({
        where: {
          UserId: userId,
          FundId: fundId,
        },
      });

      if (!findUserMutualFund) {
        await UserMutualFund.create({
          UserId: userId,
          FundId: fundId,
          totalUnit: units,
        });
      } else {
        await findUserMutualFund.increment('totalUnit', { by: units });
      }

      res.status(200).json({ message: `Mutual fund ${mutualFundTransaction.transactionType} successful` });
    } catch (error) {
      next(error);
    }
  }

  static async sellFund(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { fundId } = req.body;
      const units = Number(req.body.units);
      const userId = req.user.id;

      const findUserSourceFund = await UserMutualFund.findOne({
        where: {
          UserId: userId,
          FundId: fundId,
        },
      });

      if (!findUserSourceFund) throw { name: 'invalidTransaction' };
      if (findUserSourceFund.totalUnit < units) throw { name: 'invalidTransaction' };
      await findUserSourceFund.decrement('totalUnit', {
        by: units,
        transaction: t,
      });

      const fund = await Fund.findByPk(fundId);
      if (!fund) throw { name: 'FundNotFound' };

      const userAmount = units * fund.nav;
      const tax = countTax(userAmount);
      const fees = countFees(userAmount);

      const transactionDate = getTransactionDate();

      const createTransaction = await MutualFundTransaction.create(
        {
          TransactionId: uuid4(),
          UserId: userId,
          FundId: fundId,
          date: transactionDate,
          nav: fund.nav,
          transactionType: 'sell',
          units,
          amount: userAmount,
          fees,
          tax,
          totalAmount: userAmount - fees - tax,
          status: 'success',
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      res.status(201).json({
        message: `Mutual fund sell successful, you will get Rp.${createTransaction.totalAmount}`,
        data: {
          transactionType: createTransaction.transactionType,
          units: createTransaction.units,
          nav: createTransaction.nav,
          totalAmount: createTransaction.totalAmount,
        },
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async switchFund(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { sourceFundId, targetFundId } = req.body;
      const units = Number(req.body.units);
      const userId = req.user.id;

      const sourceFund = await Fund.findByPk(sourceFundId);
      const targetFund = await Fund.findByPk(targetFundId);

      if (!sourceFund || !targetFund) throw { name: 'FundNotFound' };

      const findUserSourceFund = await UserMutualFund.findOne({
        where: {
          UserId: userId,
          FundId: sourceFundId,
        },
      });

      if (!findUserSourceFund) throw { name: 'invalidTransaction' };
      if (Number(findUserSourceFund.totalUnit) <= units) throw { name: 'invalidTransaction' };

      await findUserSourceFund.decrement('totalUnit', {
        by: units,
        transaction: t,
      });

      const newUnits = switchUnits(units, sourceFund.nav, targetFund.nav);

      const findUserTargetFund = await UserMutualFund.findOne({
        where: {
          UserId: userId,
          FundId: targetFundId,
        },
      });

      if (!findUserTargetFund) {
        await UserMutualFund.create(
          {
            UserId: userId,
            FundId: targetFundId,
            totalUnit: newUnits,
          },
          {
            transaction: t,
          }
        );
      } else {
        await findUserTargetFund.increment('totalUnit', {
          by: newUnits,
          transaction: t,
        });
      }

      const transactionDate = getTransactionDate();

      await MutualFundTransaction.create(
        {
          TransactionId: uuid4(),
          UserId: userId,
          FundId: targetFundId,
          date: transactionDate,
          nav: targetFund.nav,
          transactionType: 'switch',
          units: newUnits,
          amount: 0,
          fees: 0,
          tax: 0,
          totalAmount: 0,
          status: 'success',
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      res.status(201).json({ message: `Mutual fund switch successful, from ${units} units to ${newUnits} units` });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

module.exports = Controller;
