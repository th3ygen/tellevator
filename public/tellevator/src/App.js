import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import {
  Grid
} from '@material-ui/core';

import './App.scoped.scss';

import Dashboard from './components/Dashboard';
import VideoAds from './components/VideoAds';
import VideoCall from './components/VideoCall';

class App extends Component {
  render() {
    const urls = [
      {
        label: 'Operator end',
        path: '/admin?id=<unique_id>'
      },
      {
        label: 'Device end',
        path: '/dev?id=<unique_id>'
      }
    ];
    return (
        <Router>
          <div className="App">
            <Switch>
              <Route path='/call'>
                <VideoCall role={'dev'} id={'d1'}/>
              </Route>
              <Route path='/ads'>
                <VideoAds/>
              </Route>
              <Route path='/admin'>
                <Dashboard />
              </Route>

              <Route exact path='/' >
                <Grid container justify={"center"} className="home-wrapper">
                  <Grid item xs={12} className="header">
                    Confined Emergency Intercom System
                  </Grid>
                  <Grid item xs={8} className="body">
                    <Grid item xs={12} className="guide">
                      <span>
                        Welcome to the homepage of this system.
                        Test
                      </span>
                    </Grid>
                    <Grid
                      item xs={12}
                      container
                      justify={"space-around"}
                      className="urls"
                    >
                      {
                        urls.map((d, x) => (
                        <Grid key={x} item xs={4}>
                          <div className="url">
                            <div className="header">
                              <span>{d.label}</span>
                            </div>
                            <div className="body">
                              <div className="body-item">
                                <div className="label">
                                  <span>Path:</span>
                                </div>
                                <div className="path">
                                  <span>{d.path}</span>
                                </div>
                              </div>
                            </div>
                            
                          </div>
                        </Grid>
                        ))
                      }
                      
                    </Grid>
                  </Grid>
                  
                </Grid>
              </Route>
            </Switch>
          </div>
        </Router>
    );
  }
}

export default App;
