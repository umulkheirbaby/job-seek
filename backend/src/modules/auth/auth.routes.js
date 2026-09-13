const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authLimiter = require('../../middleware/authLimiter');
const { register, login, logout, me } = require('./auth.controller');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
