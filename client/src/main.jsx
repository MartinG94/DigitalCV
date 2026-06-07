import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { App } from './App.jsx';
import { h } from './components/ui.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  h(
    React.StrictMode,
    null,
    h(BrowserRouter, null, h(ThemeProvider, null, h(AuthProvider, null, h(App))))
  )
);
