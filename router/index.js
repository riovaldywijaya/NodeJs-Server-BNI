const express = require('express');
const Controller = require('../controllers/controller');
const authentication = require('../middlewares/authentication');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Server is running..');
});
router.get('/auth/google', Controller.googleRedirect);
router.get('/auth/google/callback', Controller.googleCallback);
router.post('/login', Controller.userLogin);
router.get('/pub/funds', Controller.findAllFunds);

router.use(authentication);
router.get('/funds', Controller.findAllFunds);
router.post('/funds/buy', Controller.buyFund);
router.post('/funds/sell', Controller.sellFund);
router.post('/funds/switch', Controller.switchFund);
router.post('/payment/generate-midtrans-token', Controller.generateMidtransToken);
router.patch('/payment/update-status-transaction', Controller.updateStatusPayment);

module.exports = router;
