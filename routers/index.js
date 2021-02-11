const express = require('express');
const router = express.Router();

const controller = {
    device: require('../controllers/device.controller')
};
const service = {
    auth: require('../services/auth.service')
};
const middleware = {
    jwt: require('../middlewares/jwt.middleware')
};

router.use('/scripts', require('./scripts.router'));
router.use('/peer', require('./peer.router'));
router.use('/res', require('./resource.router'));

/* device key */
router.get('/login', controller.device.login);
router.get('/register', controller.device.register);
router.get('/logout', middleware.jwt.verify, controller.device.login);
router.get('/getmeakey', async (req, res) => {
    try {
        const key = await service.auth.findAvailableKey();

        res.status(200).json({
            key
        });
    } catch(e) {
        res.status(400).json({
            error: e
        });
    }
});

module.exports = router;