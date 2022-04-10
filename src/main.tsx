import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { Props } from './component/Control';
const spineData: Props = JSON.parse(document.getElementById('SPINEDATA')!.innerHTML);
spineData.prefix = spineData.prefix.replace(
  'https://static.prts.wiki/spine/',
  'https://static.prts.wiki/spine38/',
);
ReactDOM.render(
  <React.StrictMode>
    <App {...spineData} />
  </React.StrictMode>,
  document.getElementById('root'),
);
