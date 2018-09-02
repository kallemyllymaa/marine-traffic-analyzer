import React from 'react';
import ReactDOM from 'react-dom';
import Ships from './Ships';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Ships />, div);
  ReactDOM.unmountComponentAtNode(div);
});
