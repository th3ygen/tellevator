const express = require('express');
const path = require('path');
const root = require('app-root-path');

const router = express.Router();

router.get('/wow', (req, res) => res.status(200).json({message: 'wow'}));

module.exports = router;