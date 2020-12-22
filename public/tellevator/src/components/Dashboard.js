import React, { Component } from 'react';
import './Dashboard.scoped.scss';

import VideoCall from './VideoCall';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            time: new Date().toString().split(' ')[4].split(':').splice(0, 2).join(':'),
            date: new Date().toString().split(' ').splice(0, 4).join(' ')
        };

        this.updateDateTime = this.updateDateTime.bind(this);
    }
    
    componentDidMount() {
        // get parameters from
        // ?id=id_here
        const params = {};
        if (window.location.href.split('?').length > 1) {
            window.location.href.split('?')[1].split('&').forEach(k => {
                const t = k.split('=');
                params[t[0]] = t[1];
            });

            this.setState({
                ...params
            });
        }
        
        setInterval(this.updateDateTime, 1000);

        this.setState({
            ready: false
        });
    }

    updateDateTime() {
        this.setState({
            time: new Date().toString().split(' ')[4].split(':').splice(0, 3).join(':'),
            date: new Date().toString().split(' ').splice(0, 4).join(' ')
        });
    }

    render() {
        
        return (
            <div className="wrapper">
                <div className="videoCall">
                    {
                        (this.state.ready) ? <VideoCall role={'admin'} id={this.state.id}></VideoCall> : ''
                    }
                </div>
                
                <div className="dashboard">
                    <div className="datetime">
                        <div className="time">
                            {this.state.time}
                        </div>
                        <div className="date">
                            {this.state.date}
                        </div>
                    </div>

                    <div className="stats">
                        <div className="item">
                            <div className="label">
                                Connected items
                            </div>
                            <div className="value">
                                15
                            </div>
                        </div>
                        <div className="item">
                            <div className="label">
                                Recent call
                            </div>
                            <div className="value">
                                15
                            </div>
                        </div>
                        <div className="item">
                            <div className="label">
                                Total call
                            </div>
                            <div className="value">
                                15
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Dashboard
