import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/dark-mode.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
