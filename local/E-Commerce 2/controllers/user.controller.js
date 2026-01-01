const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
        const user = await userModel.createUSer(username, email, hashed);
        res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only send cookie over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        sameSite: 'strict' // CSRF protection
    });

    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
};

module.exports = { login, signup };
