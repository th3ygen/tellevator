// load .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = require('https').createServer({
    cert: fs.readFileSync(path.join(__dirname, 'cert/theygen.crt')),
    key: fs.readFileSync(path.join(__dirname, 'cert/theygen.key'))
}, app);

// connect to mqtt broker
require('./services/mqtt.service');

const controller = {
    peer: require('./controllers/peer.controller')
};

// cors
app.use(cors());

// routes
app.use(require('./routers'));
app.get('/wow', (req, res) => res.status(200).json({message: 'wow'}));

// web static file
app.use('/', express.static(path.join(__dirname, 'test')));

// peerjs server
const peerServer = ExpressPeerServer(server, {
    path: '/peerserver'
});

peerServer.on('connection', controller.peer.conn);
peerServer.on('disconnect', controller.peer.disc);

app.use(peerServer);

server.listen(8080, () => {
    console.log(chalk.green('[SERVER]'), 'listening to port', chalk.yellow(8080));
});