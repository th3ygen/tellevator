const jwt = require('jsonwebtoken');
const uuid = require('short-uuid');
const readline = require('readline');
const bcrypt = require('bcrypt');
const fs = require('fs');

const adminCred = require('../adminCred.json');

const keys = [];

const readText = question => (
    new Promise((resolve, reject) => {
        try {
            const read = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false
            });

            read.question(question, res => {
                resolve(res);
                read.close();
            });
        } catch(e) {
            reject(e);
        }
    })
);

const init = async () => {
    if (adminCred.username === '') {
        /* ask for admin cred */
        const username = await readText('Enter admin username:\n');
        const password = await readText('Enter admin password:\n');

        adminCred.username = username;

        try {
            const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT));
            adminCred.password = await bcrypt.hash(password, salt);
            fs.writeFile('adminCred.json', JSON.stringify(adminCred), err => {});
        } catch(e) {
            console.log(e);
        }
    }

    for (let x = 0; x < process.env.TOTAL_DEVICE_API_KEY; x++) {
        const key = uuid.generate();
        keys.push({
            key, used: false, distributed: false, role: 'device'
        });
    }
    for (let x = 0; x < process.env.TOTAL_OPERATOR_API_KEY; x++) {
        const key = uuid.generate();
        keys.push({
            key, used: false, distributed: false, role: 'operator'
        });
    }
};
module.exports = {
    login: key => (
        new Promise((resolve, reject) => {
            const x = keys.findIndex(o => (
                o.key === key && !o.used
            ));

            if (x > -1) {
                keys[x].used = true;
        
                const token = jwt.sign({
                    key: keys[x].key, role: keys[x].role
                }, process.env.JWT_KEY);
        
                resolve(token);
            } else {
                reject('invalid key');
            }
        })
    ),
    logout: payload => (
        new Promise((resolve, reject) => {
            const x = keys.findIndex(q => (
                o.key === payload.key
            ));

            keys[x].used = false;

            resolve();
        })
    ),
    findAvailableKey: () => (
        new Promise((resolve, reject) => {
            const x = keys.findIndex(q => (
                !q.distributed && role === 'device'
            ));

            if (x > -1) {
                keys[x].distributed = true;
            
                resolve(keys[x].key);
            } else {
                reject('no key available');
            }
        })
    ),
    findAvailableKeyForAdmin: (username, password) => (
        new Promise(async (resolve, reject) => {
            if (username !== adminCred.username) {
                return reject('access denied');
            }

            const isPasswordCorrect = await bcrypt.compare(password, adminCred.password);
            if (!isPasswordCorrect) {
                return reject('access denied');
            }

            const x = keys.findIndex(q => (
                !q.distributed && role === 'operator'
            ));

            if (x > -1) {
                keys[x].distributed = true;
            
                resolve(keys[x].key);
            } else {
                reject('no key available');
            }
        })
    ),
    revokeKey: key => (
        new Promise((resolve, reject) => {
            const x = keys.findIndex(q => (
                q.key === key
            ));
    
            if (x > -1) {
                keys[x].distributed = false;

                resolve();
            }  else {
                reject('invalid key');
            }
        })
    ),
    init
};