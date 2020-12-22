const express = require('express');
const fs = require('fs');
const path = require('path');
const root = require('app-root-path');
const utils = require('util');

const readdir = utils.promisify(fs.readdir);

const router = express.Router();

router.use('/video', express.static(path.join(root.path, 'res/video')));

// structured
router.get('/video/ads', async (req, res) => {
    const files = await readdir(path.join(root.path, 'res/video'));

    res.status(200).json(files);
});

module.exports = router;