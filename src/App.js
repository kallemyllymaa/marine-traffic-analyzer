import React, { Component } from 'react';

import { HashRouter as Router, Route } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.

import './App.css';

import { Grid } from 'react-bootstrap';

import Header from './components/Header';

import Intro from './pages/Intro';
import Ships from './pages/Ships';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Header />
          <Grid>
            <Route exact path="/" component={Intro} />
            <Route exact path="/ships" component={Ships} />
          </Grid>
        </div>
      </Router>
    );
  }
}

export default App;
