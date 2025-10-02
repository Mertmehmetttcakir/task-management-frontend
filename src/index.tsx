import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

const rootEl = document.getElementById('root'); // index.html ile aynı olmalı
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  // Hata ayıklama için
  console.error('Root element bulunamadı. index.html içinde <div id="root"></div> var mı?');
}