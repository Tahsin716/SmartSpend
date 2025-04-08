const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, deleteExpense, getSpendingTrends } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addExpense);
router.get('/', getExpenses); 
router.get('/trends', getSpendingTrends);
router.route('/:id')
    .delete(deleteExpense);

module.exports = router;