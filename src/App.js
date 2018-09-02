import React, { Component } from 'react';

import { HashRouter as Router, Route } from "react-router-dom";

import logo from './logo.svg';
import './App.css';

import Intro from './pages/Intro';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <Route exact path="/" component={Intro} />
        </div>
      </Router>
    );
  }
}

export default App;
