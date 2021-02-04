// load .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = require('https').createServer({
    cert: fs.readFileSync(path.join(__dirname, 'cert/theygen.crt')),
    key: fs.readFileSync(path.join(__dirname, 'cert/theygen.key'))
}, app);

(async () => {
    // connect to mqtt broker
    require('./services/mqtt.service');

    // init auth service
    await require('./services/auth.service').init();

    const controller = {
        peer: require('./controllers/peer.controller')
    };

    // cors
    app.use(cors());

    // body parser
    app.use(bodyParser.json());

    // routes
    app.use(require('./routers'));

    // peerjs server
    const peerServer = ExpressPeerServer(server, {
        path: '/peerserver',
        key: process.env.PEERJS_KEY,
        ssl: {
            cert: fs.readFileSync(path.join(__dirname, 'cert/theygen.crt')),
            key: fs.readFileSync(path.join(__dirname, 'cert/theygen.key'))
        }
    });

    peerServer.on('connection', controller.peer.conn);
    peerServer.on('disconnect', controller.peer.disc);

    app.use(peerServer);

    server.listen(8080, () => {
        console.log(chalk.green('[SERVER]'), 'listening to port', chalk.yellow(8080));
    });
})();

