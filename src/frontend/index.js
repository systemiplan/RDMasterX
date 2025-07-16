import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

console.log('=== RDMasterX Starting ===');

const root = createRoot(document.getElementById('root'));
root.render(<App />);

console.log('=== RDMasterX Loaded ===');
