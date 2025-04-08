const Expense = require('../models/expense');

// @desc    Log a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ message: 'Category, amount, and date are required' });
    }

    const expense = new Expense({
      user: req.user._id, 
      category,
      amount,
      date,
      description
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    console.error(`Error adding expense: ${error.message}`);
    res.status(500).json({ message: 'Server error adding expense' });
  }
};

// @desc    Get expenses for logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }); 
    res.json(expenses);
  } catch (error) {
    console.error(`Error fetching expenses: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  const userId = req.user._id; 
  const expenseId = req.params.id; 

  try {
      const expense = await Expense.findById(expenseId);

      if (!expense) {
          return res.status(404).json({ message: 'Expense not found.' });
      }

     
      if (expense.user.toString() !== userId.toString()) {
          return res.status(401).json({ message: 'User not authorized to delete this expense.' });
      }

      await expense.remove();

      res.status(200).json({ message: 'Expense removed successfully.' });

  } catch (error) {
      console.error(`Error deleting expense: ${error.message}`);
      if (error.name === 'CastError') {
           return res.status(400).json({ message: 'Invalid expense ID format.' });
      }
      res.status(500).json({ message: 'Server error deleting expense.' });
  }
};

// @desc    Get spending trends (example: total spending per category this month)
// @route   GET /api/expenses/trends
// @access  Private
const getSpendingTrends = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const trends = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$category', 
                    totalAmount: { $sum: '$amount' } 
                }
            },
            {
                $project: { 
                   category: '$_id',
                   totalAmount: 1,
                   _id: 0 
                }
            },
            {
               $sort: { totalAmount: -1 } 
            }
        ]);


        res.json(trends);
    } catch (error) {
        console.error(`Error fetching spending trends: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching trends' });
    }
};


module.exports = { addExpense, getExpenses, deleteExpense, getSpendingTrends };