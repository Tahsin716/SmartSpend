const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, consent } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
     
    if (!consent || typeof consent.dataProcessing !== 'boolean' || typeof consent.externalApiUsage !== 'boolean') {
        return res.status(400).json({ message: 'Valid consent information is required' });
    }

    if (!consent.dataProcessing) {
        return res.status(400).json({ message: 'Consent for data processing is mandatory for registration.' });
    }


    try {
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            consent: { 
                dataProcessing: consent.dataProcessing,
                externalApiUsage: consent.externalApiUsage,
            }
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                consent: user.consent,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(`Error registering user: ${error.message}`);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                consent: user.consent, 
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`Error logging in user: ${error.message}`);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    if (req.user) {
        res.json({
             _id: req.user._id,
             name: req.user.name,
             email: req.user.email,
             consent: req.user.consent,
             createdAt: req.user.createdAt, 
        });
    } else {
        res.status(404).json({ message: 'User not found' }); 
    }
};

// @desc    Update user consent settings
// @route   PUT /api/auth/profile/consent
// @access  Private
const updateUserConsent = async (req, res) => {
    const { dataProcessing, externalApiUsage } = req.body;

    if (typeof dataProcessing !== 'boolean' || typeof externalApiUsage !== 'boolean') {
        return res.status(400).json({ message: 'Invalid consent data provided.' });
    }

     if (!dataProcessing) {
         return res.status(400).json({ message: 'Consent for core data processing cannot be revoked while using the application.' });
     }


    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.consent.dataProcessing = dataProcessing;
            user.consent.externalApiUsage = externalApiUsage;

            const updatedUser = await user.save();

            res.json({
                 _id: updatedUser._id,
                 name: updatedUser.name,
                 email: updatedUser.email,
                 consent: updatedUser.consent,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(`Error updating consent: ${error.message}`);
        res.status(500).json({ message: 'Server error updating consent settings.' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserConsent,
};