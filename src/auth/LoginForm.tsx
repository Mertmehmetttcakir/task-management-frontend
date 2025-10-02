import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { authStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Alert
} from '@mui/material';

const LoginForm: React.FC = observer(() => {
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.loginAsync();
      // Başarılıysa effect tetiklenecek; burada ekstra kontrol istersen:
      if (authStore.isLoggedIn) navigate('/dashboard', { replace: true });
    } catch {
      /* Hata authStore.error içinde varsayılan */
    }
  }, [navigate]);

  useEffect(() => {
    if (authStore.isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [authStore.isLoggedIn, navigate]);

  if (authStore.isLoggedIn) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme => theme.palette.background.default,
        p: 2
      }}>
        <Paper elevation={4} sx={{ p: 4, width: 380, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Hoş geldiniz 👋</Typography>
            <Typography variant="body2" sx={{ opacity: .75 }}>{authStore.email}</Typography>
          <Stack direction="row" gap={1}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              fullWidth
              color="error"
              variant="outlined"
              onClick={() => authStore.logout()}
            >
              Çıkış Yap
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: theme => theme.palette.background.default,
      p: 2
    }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>Task Manager</Typography>
          <Typography variant="body2" sx={{ opacity: .7 }}>Hesabınıza giriş yapın</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="email"
            label="Email"
            value={authStore.email}
            onChange={(e) => (authStore.email = e.target.value)}
            disabled={authStore.isLoading}
            fullWidth
            required
            size="small"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={authStore.rememberMe}
                onChange={(e) => (authStore.rememberMe = e.target.checked)}
                disabled={authStore.isLoading}
              />
            }
            label="Beni hatırla"
          />

          {authStore.error && (
            <Alert severity="error" variant="outlined">{authStore.error}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={authStore.isLoading}
            fullWidth
          >
            {authStore.isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: .5 }}>
            © {new Date().getFullYear()} Task Manager
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
});

export default LoginForm;