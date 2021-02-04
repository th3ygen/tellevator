const mqtt = require('../services/mqtt.service');
const root = require('app-root-path').path;
const fs = require('fs');
const util = require('util');
const path = require('path');

const writeFileAsync = util.promisify(fs.writeFile);

const peers = {
    admin1: {
        op: true,
        caller: ''
    }
};
const queue = [];
const assigned = [];

const utils = {
    findAvailableOpId: () => (
        new Promise((resolve, reject) => {
            try {
                const id = Object.keys(peers).find(x => ( peers[x].op && peers[x].caller === '' ));

                if (id) {
                    resolve(id);
                } else {
                    resolve('');
                }
            } catch(e) {
                reject(e);
            }
        })
    )
};

// listen for client request
mqtt.subscribe('peer/op/call/req');
mqtt.subscribe('peer/op/call/done');

mqtt.on('message', async (topic, payload, packet) => {
    try {
        if (topic === 'peer/op/call/req' || topic === 'peer/op/call/done') {
            const { data } = JSON.parse(payload);

            if(!data) {
                return mqtt.publish('peer/op/call/res', JSON.stringify({
                    opId: null, message: 'missing data in payload'
                }));
            }

            const { callerId } = data;

            if (topic === 'peer/op/call/req') {
                const opId = await utils.findAvailableOpId();
    
                if (opId === '') {
                    queue.push(callerId);
    
                    mqtt.publish('peer/op/call/res', JSON.stringify({
                        opId: null, message: 'queue'
                    }));
                } else {
                    peers[opId].caller = callerId;
    
                    mqtt.publish('peer/op/call/res', JSON.stringify({
                        opId, message: 'assigned'
                    }));
                }
            }
        
            if (topic === 'peer/op/call/done') {
                const opId = Object.keys(peers).find(k => (
                    peers[k].caller === callerId
                ));

                console.log(opId);

                if (peers[opId]) {
                    if (queue.length > 0) {
                        peers[opId].caller = queue[0];
        
                        mqtt.publish('peer/op/call/next', JSON.stringify({
                            callerId: queue.shift(),
                            opId
                        }));
                    } else {
                        peers[opId].caller = '';
                    }
                } else throw new Error(`Admin id ${opId} does not exist`);
            }
        }

        console.log('peers:', peers);
        console.log('queue:', queue);
    } catch(e) {
        console.log('Error:', e.message);
    }
    
});

module.exports = {
    conn: peer => {
        if (process.env.DEBUG) {
            console.log('New peer connected', n);
        }
        
        peers[peer.id] = {
            caller: '',
            op: admins.indexOf(peer.id) > -1,
            createdAt: Date.now()
        };

        const list = Object.keys(peers).map(id => ({
            id,
            data: peers[id]
        }));
        mqtt.publish('peer/conn', JSON.stringify({
            peers: list
        }));
    },
    disc: peer => {
        // signals to all peers
        mqtt.publish('peer/close', peer.id);
        console.log('Peer disconnected:', peer.id);

        // free called admin
        if (peers[peer.id].op) {
            peers[peer.id].caller = '';
            delete peers[peers[peer.id].caller];

            mqtt.publish('peer/op/call/next', peer.id);
        }
    },
    newAdmin: async id => {
        admins.push(id);
        await writeFileAsync(path.join(root, 'admins.json'), JSON.stringify(admins));
        return admins;
    },
    peers
};