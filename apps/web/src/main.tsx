import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/layout/ErrorBoundary.tsx';
import './index.css';

void document.fonts.load('24px "Material Symbols Outlined"').then(() => document.fonts.ready).then(() => {
  document.documentElement.dataset.iconsReady = 'true';
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
