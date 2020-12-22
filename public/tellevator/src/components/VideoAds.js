import React, { Component, createRef } from 'react';
import './VideoAds.scoped.scss';

import MQTT from 'mqtt';

import VideoCall from './VideoCall';

export class VideoAds extends Component {
    constructor(props) {
        super(props);

        this.videoElement = createRef();

        this.state = {
            ready: false,
            call: false
        };
    }

    componentDidMount() {
        const mqttConnAsync = url => (
            new Promise((resolve, reject) => {
                const conn = MQTT.connect(url);
                conn.on('connect', () => resolve(conn));
                conn.on('error', e => reject({
                    error: e
                }));
            })
        );

        const loadVideos = async () => {
            const videos = await (await fetch('https://theygen:8080/res/video/ads')).json();

            if (videos.length > 0) {
                this.videoElement.current.src = 'https://theygen:8080/res/video/' + videos[0];
            }
        };
        
        (async () => {
            // connect to mqtt
            console.log('Connecting to MQTT broker...');
            const mqtt = await mqttConnAsync('wss://theygen:9001');
            console.log('Connected to MQTT broker');

            mqtt.subscribe('controller/call');
            mqtt.subscribe('controller/endcall');

            mqtt.on('message', (topic, payload, packet) => {
                topic = topic.split('/');

                if (topic[1] === 'call') {
                    this.videoElement.current.src = null;
                    this.setState({ call: true });
                }

                if (topic[1] === 'endcall') {
                    this.setState({ call: false });
                    loadVideos();
                }
                
            });

            loadVideos();
        })();
    }

    render() {
        return (
            <div className='wrapper'>
                { this.state.call ?
                    (<div className="call-wrapper">
                        <VideoCall role={'dev'} id={''}></VideoCall>
                    </div>)
                :
                    ''
                }
                <video ref={this.videoElement} playsInline autoPlay muted loop></video>
            </div>
        )
    }
}

export default VideoAds
