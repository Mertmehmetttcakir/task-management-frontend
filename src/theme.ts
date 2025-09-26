import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: 'rgba(30,41,59,0.65)'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.08)'
        }
      }
    }
  }
});