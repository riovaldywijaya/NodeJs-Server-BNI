const { Fund } = require('../models');

const getTotalAsset = async (userFunds, userId) => {
  let totalAsset = 0;

  await Promise.all(
    userFunds.map(async (userFund) => {
      try {
        const fund = await Fund.findByPk(userFund.id, {
          where: {
            UserId: userId,
          },
        });

        if (fund) {
          totalAsset += Number(fund.nav) * Number(userFund.totalUnit);
        }
      } catch (error) {
        console.error('Error while fetching fund:', error);
      }
    })
  );

  return Math.round(totalAsset);
};

module.exports = getTotalAsset;
