import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('app')!);
  root.render(<App />);
});
