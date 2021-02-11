import React, { Component, createRef } from 'react';
import './VideoCall.scoped.scss';

import MQTT from 'mqtt';
import Peer from 'peerjs';

export class VideoCall extends Component {
    constructor(props) {
        super(props);

        this.state = {
            role: props.role,
            id: props.id,
            caller: ''
        };

        this.mqtt = createRef();
        this.peer = createRef();
        this.stream = createRef();
        this.video = createRef();
    }

    componentDidMount() {
        const peerConnAsync = (id, opt) => {
            return new Promise((resolve, reject) => {
                let peer;
                if (id !== '') {
                    peer = new Peer(id, opt);
                } else {
                    peer = new Peer(opt);
                }

                peer.on('open', () => {
                    return resolve(peer);
                });
            });
        };

        const mqttConnAsync = (host) => (
            new Promise((resolve, reject) => {
                let username = '', password = '';

                const isLoggedIn = localStorage.getItem('mqttLoggedIn');
                if (isLoggedIn === 'true') {
                    username = localStorage.getItem('mqttUsername');
                    password = localStorage.getItem('mqttPassword');
                } else {
                    username = prompt("MQTT broker username");
                    password = prompt("MQTT broker password");
                }

                const conn = MQTT.connect(host, {
                    port: 9001,
                    username, password
                });
                conn.on('connect', () => {
                    localStorage.setItem('mqttUsername', username);
                    localStorage.setItem('mqttPassword', password);
                    localStorage.setItem('mqttLoggedIn', 'true');

                    resolve(conn);
                });
                conn.on('error', async e => {
                    alert('Connection failure: ' + e)
                    await mqttConnAsync(host);
                    resolve(conn);
                });
            })
        );

        const limitBandwidth = sdp => {
            // split sdp message into an array.
            // each element of the array is one line of the sdp
            let sdpLines = sdp.split('\r\n');
          
            // search for media, and then add bandwidth limit
            // Search for m line.
            for (let i = 0; i < sdpLines.length; i++)
              if (sdpLines[i].search('m=') !== -1)
                sdpLines = insertBandwidthLimit( sdpLines, i );
          
            // reconstruct the SDP message
            sdp = sdpLines.join('\r\n');

            return sdp;
        };

        const insertBandwidthLimit = (sdpLines, index) => {
            // compute limit depending on media type
            let limit;
            if( sdpLines[index].search('audio') !== -1 )
              limit = '50';
            else
              limit = '256';
            // create a new line
            const newLine = "b=AS:" + limit;
            // insert the new line after the media line
            sdpLines.splice(index+1,0,newLine);
          
            return sdpLines;   
        }

        (async () => {
            // get video and audio streams
            if (!this.stream.current) {
                console.log('Loading media devices...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            
                if (!stream) {
                    console.error('Something went wrong when fetching user stream');
                } else {
                    console.log('Loaded media devices');
                }

                this.stream.current = stream;
            }
            
            const stream = this.stream.current;

            // connect to mqtt broker for signaling
            console.log('Connecting to MQTT broker...');
            const mqtt = await mqttConnAsync('wss://theygen');

            this.mqtt.current = mqtt;

            if (mqtt.error) {
                console.error('MQTT connection error:', mqtt.error);
            } else {
                console.log('Connected to MQTT broker');
            }

            // listen to signals
            mqtt.on('message', (topic, payload, packet) => {
                if (payload.toString() === this.state.caller) {
                    this.video.current.srcObject = null;

                    this.setState({ caller: '' });

                    // close media stream
                    /* this.stream.current.getTracks().forEach(track => track.stop()); */
                }
            });

            console.log('Connecting to peer server...');

            let peer;
            if (this.state.id) {
                peer = await peerConnAsync(this.state.id, 'https://theygen:8080/peerserver');
            } else {
                peer = await peerConnAsync('', 'https://theygen:8080/peerserver');
            }

            this.peer.current = peer;

            if (peer) {
                console.log('Connected to peer server');
            } else {
                console.error('Peer connection error:', peer);
            }

            if (this.state.role === 'admin') {
                mqtt.subscribe('peer/op/call/done');

                peer.on('call', c => {
                    this.setState({ caller: c.peer });
                    c.answer(stream, {
                        sdpTransform: limitBandwidth
                    });

                    c.on('stream', s => {
                        this.video.current.srcObject = s;

                        /* mqtt.on('message', (topic, payload, packet) => {
                            c.close();
                        }); */
                    });
                    c.on('close', () => {
                        this.video.current.srcObject = null;
                    });
                });
            } else {
                mqtt.subscribe('peer/op/call/res');
                mqtt.subscribe('peer/op/call/done');

                mqtt.publish('peer/op/call/req', JSON.stringify({
                    data: {
                        callerId: this.state.id
                    }
                }));

                mqtt.on('message', (topic, payload, packet) => {
                    payload = JSON.parse(payload);

                    if (topic === 'peer/op/call/res') {
                        if (payload.message === 'assigned') {
                            console.log('assigned', payload);
                            peer.call(payload.opId, stream, {
                                sdpTransform: limitBandwidth
                            }).on('stream', s => {
                                this.video.current.srcObject = s;
                            });
                        }
                    }
                });
            }
            
        })();
    }
    
    componentWillUnmount() {
        this.mqtt.current.end(true);
        this.stream.current.getTracks().forEach(track => track.stop());
        this.peer.current.destroy();
    }

    render() {
        return (
            <div className='wrapper'>
                <video ref={this.video} autoPlay playsInline/>
            </div>
        )
    }
}

export default VideoCall
