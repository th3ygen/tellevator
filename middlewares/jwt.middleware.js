const jwt = require('jsonwebtoken');

module.exports = {
    verify: (req, res, next) => {
        if (!req.headers.auth) {
            return res.status(401).json({
                error: 'no token provided'
            });
        }

        const token = req.headers.auth;

        const isTokenValid = jwt.verify(token);

        if (!isTokenValid) {
            return res.status(401).json({
                error: 'invalid token'
            });
        }
        
        req.token = token;
        req.payload = isTokenValid;

        next();
    }
};