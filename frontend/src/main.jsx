import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { establishOperatorSession, installAuthenticatedFetch } from './operatorSession';

async function bootstrap() {
  try {
    await establishOperatorSession();
    installAuthenticatedFetch();
  } catch (error) {
    // Read-only pages remain usable and mutations receive a clear 401 response.
    console.error('OmniKin operator pairing failed:', error);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
