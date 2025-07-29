// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppKitProvider } from './components/config/appkit.tsx' // Import AppKitProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppKitProvider>
      <App />
    </AppKitProvider>
  </StrictMode>,
);