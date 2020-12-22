const express = require('express');

const controller = require('../controllers/peer.controller');

const router = express.Router();
const peer = express.Router();

router.use('/peer', peer);

peer.post('/admin', async (req, res) => {
    let admins = [];
    try {
        admins = await controller.newAdmin(req.body.id.toString());
    } catch(e) {
        return res.status(401).json({
            message: 'invalid request body'
        });
    }
    
    res.status(200).json(admins);
});

module.exports = router;