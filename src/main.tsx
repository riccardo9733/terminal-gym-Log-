import { ClerkProvider } from '@clerk/react';
import { dark } from '@clerk/themes';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key in environment variables');
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#007aff',
          colorBackground: '#201d1d',
          colorInput: '#2e2a2a',
          colorInputForeground: '#fdfcfc',
        },
      }}
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
