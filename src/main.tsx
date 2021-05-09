import 'vite/dynamic-import-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
const spineData = JSON.parse(document.getElementById('SPINEDATA')!.innerHTML);
ReactDOM.render(
  <React.StrictMode>
    <App {...spineData} />
  </React.StrictMode>,
  document.getElementById('root'),
);
