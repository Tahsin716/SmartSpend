const Budget = require('../models/budget');

// @desc    Set or update a budget for a category/month/year
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
    const { category, amount, month, year } = req.body;
    const userId = req.user._id;

    if (!category || amount === undefined || !month || !year) {
        return res.status(400).json({ message: 'Category, amount, month, and year are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ message: 'Amount must be a non-negative number.' });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || isNaN(parsedYear) || parsedYear < 2000) {
         return res.status(400).json({ message: 'Invalid month or year provided.' });
    }


    try {
        const budget = await Budget.findOneAndUpdate(
            { user: userId, category: category.trim(), month: parsedMonth, year: parsedYear }, 
            { $set: { amount: parsedAmount } }, 
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(budget); 
    } catch (error) {
        console.error(`Error setting budget: ${error.message}`);
        if (error.code === 11000) {
             return res.status(400).json({ message: 'Budget for this category and period already exists (unexpected duplicate).' });
        }
        res.status(500).json({ message: 'Server error setting budget.' });
    }
};

// @desc    Get budgets for a specific month and year
// @route   GET /api/budgets?year=YYYY&month=MM
// @access  Private
const getBudgets = async (req, res) => {
    const userId = req.user._id;
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ message: 'Year and month query parameters are required.' });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
     
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || isNaN(parsedYear) || parsedYear < 2000) {
        return res.status(400).json({ message: 'Invalid month or year provided.' });
    }

    try {
        const budgets = await Budget.find({
            user: userId,
            year: parsedYear,
            month: parsedMonth
        }).sort({ category: 1 }); 

        res.status(200).json(budgets);
    } catch (error) {
        console.error(`Error fetching budgets: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching budgets.' });
    }
};

// @desc    Delete a budget item
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    const userId = req.user._id;
    const budgetId = req.params.id;
    debugger
    try {
        const budget = await Budget.findById(budgetId);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        if (budget.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this budget.' });
        }

        await budget.deleteOne(); 
        res.status(200).json({ message: 'Budget removed successfully.' });

    } catch (error) {
        console.error(`Error deleting budget: ${error.message}`);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid budget ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting budget.' });
    }
};


module.exports = {
    setBudget,
    getBudgets,
    deleteBudget,
};