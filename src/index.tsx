import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

const container = document.getElementById('app');
if (container) {
	// Önceki içeriği temizle (eğer varsa) react18de dev. modunda iki kez render edilebiliyor!!!
	container.innerHTML = '';
	const root = createRoot(container);
	root.render(
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>,
	);
}