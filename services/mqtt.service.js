const mqtt = require('mqtt');

const client = mqtt.connect(process.env.MQTT_URL, {
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_password
});
let isConnected = false;

client.on('connect', () => {
    isConnected = true;
});

const connect = () => (
    new Promise((resolve, reject) => {
        if (isConnected) {
           return resolve();
        }

        client.on('connect', () => resolve());
    })
);

module.exports = {
    client, connect
};