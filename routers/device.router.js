const express = require('express');

const controller = require('../controllers/device.controller');
const auth = require('../middlewares/jwt.middleware');

const router = express.Router();
const peer = express.Router();

peer.post('/login', async (req, res) => controller.login);
peer.post('/logout', auth.verify, async (req, res) => controller.login);
peer.post('/register', async (req, res) => controller.register);

module.exports = router;