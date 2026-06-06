import React from './vendor/react.js';
import { createRoot } from './vendor/react-dom-client.js';
import { App } from './App.jsx';
import { h } from './components/ui.js';

createRoot(document.getElementById('root')).render(h(App));
