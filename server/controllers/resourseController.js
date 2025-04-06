const axios = require('axios');
require('dotenv').config();
const User = require('../models/user'); 

const staticArticles = [
    { id: 1, title: "Budgeting Basics", content: "Start by tracking your expenses..." },
    { id: 2, title: "Understanding Savings", content: "Pay yourself first..." },
];


// @desc    Get personalized financial advice/articles 
// @route   GET /api/resources/advice/personalized
// @access  Private
const getPersonalizedAdvice = async (req, res) => {
    try {
        const highSpendingCategory = await getHighestSpendingCategory(req.user._id); // Implement this helper function

        res.json(staticArticles);

    } catch (error) {
        console.error(`Error fetching personalized advice: ${error.response?.data || error.message}`);
        res.status(500).json({ message: 'Could not fetch personalized financial advice.' });
    }
};

async function getHighestSpendingCategory(userId) {
    // Logic similar to getSpendingTrends, but find the category with max spending
    // Example: Find category with max totalAmount over the last 3 months
    // Return the category name as a string or null/undefined if no data
    return "groceries"; 
}


module.exports = { getPersonalizedAdvice };