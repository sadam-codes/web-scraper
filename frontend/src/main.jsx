// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css"
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }}
    />

  </React.StrictMode>
);
