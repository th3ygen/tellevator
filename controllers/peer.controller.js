const mqtt = require('../services/mqtt.service');
const root = require('app-root-path').path;
const fs = require('fs');
const utils = require('util');
const path = require('path');

const writeFileAsync = utils.promisify(fs.writeFile);

const peers = {};
const admins = require(path.join(root, 'admins.json')).id;
const queue = [];

const utils = {
    findAvailableOp: () => (
        new Promise((resolve, reject) => {
            const id = Object.keys(peers).find(x => ( peers[x].op && peers[x].caller === '' ));

            if (id) {
                resolve(peers[id]);
            } else {
                reject();
            }
            
        })
    ),
    findAvailableOpId: async () => {
        const peer = await utils.findAvailableOp();

        if (peer) {
            return peer.id;
        }

        return '';
    }
};

// listen for client request
mqtt.subscribe('peer/op/request');
mqtt.subscribe('peer/op/freed');

mqtt.on('message', async (topic, payload, packet) => {
    const e = payload.toString();

    if (topic === 'peer/op/request') {
        const op = await utils.findAvailableOpId();

        if (op === '') {
            queue.push(e);
        } else {
            peers[op].caller = e;
            mqtt.publish('peer/op/available', {
                dev: e, op
            });
        }
    }

    if (topic === 'peer/op/freed') {
        if (queue.length > 0) {
            peers[e].caller = queue[0];
            mqtt.publish('peer/op/available', {
                dev: queue.shift(),
                op: e
            });
        } else {
            peers[e].caller = '';
        }
    }
});

module.exports = {
    conn: peer => {
        if (process.env.DEBUG) {
            console.log('Peer id:', peer.id, 'connected');
        }

        peers[peer.id] = {
            caller: '',
            op: admins.indexOf(peer.id) > -1,
            createdAt: Date.now()
        };
        console.log(peers);
    },
    disc: peer => {
        // signals to all peers
        mqtt.publish('peer/close', peer.id);
        console.log('Peer disconnected:', peer.id);

        // free called admin
        if (peers[peer.id].op) {
            peers[peer.id].caller = '';
            delete peers[peers[peer.id].caller];

            mqtt.publish('peer/op/freed', peer.id);
        }
    },
    requestOp: utils.callAvailableOp,
    newAdmin: async id => {
        admins.push(id);
        await writeFileAsync(path.join(root, 'admins.json'), JSON.stringify(admins));
        return admins;
    },
    peers
};