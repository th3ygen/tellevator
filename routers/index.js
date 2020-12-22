const express = require('express');
const router = express.Router();

router.use('/scripts', require('./scripts.router'));
router.use('/peer', require('./peer.router'));
router.use('/res', require('./resource.router'));

module.exports = router;