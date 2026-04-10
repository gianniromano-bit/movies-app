const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// REGISTER PAGE
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// REGISTER
router.post('/register', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('auth/register', { error: "All fields required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashed });
    await user.save();

    res.redirect('/login');
});

// LOGIN PAGE
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// LOGIN
router.post('/login', async(req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return res.render('auth/login', { error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
        return res.render('auth/login', { error: "Invalid credentials" });
    }

    req.session.userId = user._id;
    res.redirect('/movies');
});

// LOGOUT
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;