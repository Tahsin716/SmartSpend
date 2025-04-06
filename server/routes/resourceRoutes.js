const express = require('express');
const router = express.Router();
const { getStaticArticles, getPersonalizedAdvice } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware'); 

router.get('/articles/static', getStaticArticles);

router.get('/advice/personalized', protect, getPersonalizedAdvice);

module.exports = router;