const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = mongoose.model('User');

const services = {
    auth: require('../services/auth.service')
};

module.exports = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });

            if (!user) {
                throw new Error('invalid username');
            }

            const isPasswordValid = await bcrypt.compare(password, user.hash);

            if(!isPasswordValid) {
                throw new Error('invalid password');
            }

            const token = jwt.sign({
                role: user.role
            }, process.env.JWT_KEY);

            res.status(200).json({
                token, broker: {
                    username: process.env.MQTT_USERNAME,
                    password: process.env.MQTT_PASSWORD
                }
            });
        } catch(e) {
            res.status(400).json({
                error: e.message
            });
        }
    },
    logout: async (req, res) => {
        try {
            User.logout(req.token);
        } catch(e) {
            res.status(400).json({
                error: e
            });
        }
    },
    register: async (req, res) => {
        try {
            const { username, password } = req.body;

            const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT));
            const hash = await bcrypt.hash(password, salt);

            const user = new User({
                username, hash, role: 'dev'
            });
        
            await user.save();

            res.status(200).json({
                message: 'user created'
            });
        } catch(e) {
            console.log(e);
            res.status(400).json({
                error: e.message
            });
        }
    }
};