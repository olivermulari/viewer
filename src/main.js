import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import 'normalize.css';
import './styles/style.scss';

applyFullWindowHeight();

function applyFullWindowHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

ReactDOM.render(<App />, document.getElementById('root'));
