const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserConsent,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile/consent', protect, updateUserConsent);

module.exports = router;