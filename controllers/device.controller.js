const jwt = require('jsonwebtoken');

const services = {
    auth: require('../services/auth.service')
};

module.exports = {
    login: async (req, res) => {
        try {
            if (!req.query.key) {
                return res.status(403).json({
                    error: 'key not provided'
                });
            }

            const token = await services.auth.login(req.query.key);

            res.status(200).json({
                token
            });
        } catch(e) {
            res.status(400).json({
                error: e
            });
        }
    }
};