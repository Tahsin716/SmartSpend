const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, getSpendingTrends } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addExpense);
router.get('/', getExpenses); 
router.get('/trends', getSpendingTrends);

module.exports = router;