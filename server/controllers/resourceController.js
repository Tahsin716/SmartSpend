const Expense = require('../models/expense'); 
require('dotenv').config();

const staticArticles = [
    { id: 's1', title: "Budgeting Basics: Where to Start", content: "Tracking expenses is the first step..." },
    { id: 's2', title: "Understanding Savings vs Investing", content: "Savings are typically for short-term goals..." },
    { id: 's3', title: "The Power of Compound Interest", content: "Starting early allows your money to grow..." },
    { id: 's4', title: "Dealing with Debt", content: "Prioritize high-interest debt first..." },
];

const generalTips = [
    { id: 'g1', type: 'tip', text: "Review recurring subscriptions regularly. Any you can cancel?" },
    { id: 'g2', type: 'tip', text: "Consider setting a small, achievable savings goal for this month." },
    { id: 'g3', type: 'tip', text: "Try packing lunch for work or school a few times a week to save money." },
    { id: 'g4', type: 'tip', text: "Automating savings, even small amounts, makes it easier to build reserves." },
    { id: 'g5', type: 'tip', text: "Look for free activities or events in your local area for entertainment." }
];


// @desc    Get static financial articles
// @route   GET /api/resources/articles/static
// @access  Public (or Private)
const getStaticArticles = (req, res) => {
    res.json(staticArticles);
};


// @desc    Generate SIMPLE personalized advice based on highest spending category
// @route   GET /api/resources/advice/personalized
// @access  Private
const getPersonalizedAdvice = async (req, res) => {
    const userId = req.user._id;
    const adviceList = [];

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); 

        const recentExpenses = await Expense.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        });

        let topCategory = null;
        let topAmount = 0;

        if (recentExpenses.length > 0) {
            const spendingByCategory = {};
            recentExpenses.forEach(expense => {
                spendingByCategory[expense.category] = (spendingByCategory[expense.category] || 0) + expense.amount;
            });

            for (const category in spendingByCategory) {
                if (spendingByCategory[category] > topAmount) {
                    topAmount = spendingByCategory[category];
                    topCategory = category;
                }
            }
        }

        if (topCategory) {
            adviceList.push({
                id: `top_${topCategory.replace(/\s+/g, '_').toLowerCase()}`, 
                type: 'observation', 
                text: `Your highest spending category in the last 30 days was '${topCategory}' with a total of £${topAmount.toFixed(2)}.`
            });
        } else {
            adviceList.push({
                id: 'd1',
                type: 'info',
                text: "Log your expenses consistently to see where your money is going and get personalized insights!"
            });
        }

        
        const randomIndex = Math.floor(Math.random() * generalTips.length);
        adviceList.push(generalTips[randomIndex]);


        res.json(adviceList);

    } catch (error) {
        console.error(`Error generating simplified personalized advice: ${error.message}`);
        res.status(500).json([
             generalTips[0], 
             generalTips[1]  
        ]);
    }
};

module.exports = {
    getStaticArticles,
    getPersonalizedAdvice 
};