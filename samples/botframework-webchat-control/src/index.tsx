import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WebChat from './components/WebChat/WebChat';
import reportWebVitals from './reportWebVitals';
import { StateProvider } from './context';

ReactDOM.render(
  <React.StrictMode>
    <StateProvider>
      <WebChat />
    </StateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
