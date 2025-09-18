import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Snackbar, Alert } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ResetService } from '../services/ResetService';
import { taskStore } from '../stores/taskStore';
import { primaryNav } from '../config/navigation';
import { useLocation, useNavigate } from 'react-router-dom';

interface AppSidebarProps {
  open: boolean;
  width?: number;
  onClose(): void;
  variant?: 'permanent' | 'temporary';
}

const AppSidebar: React.FC<AppSidebarProps> = ({ open, onClose, width = 220, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openReset, setOpenReset] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetError, setResetError] = React.useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = React.useState<string | null>(null);

  const items = primaryNav.filter(i => i.showInSidebar);

  const handleOpenReset = () => setOpenReset(true);
  const handleCloseReset = () => { if (!resetLoading) { setOpenReset(false); setResetError(null); } };
  const handleConfirmReset = async () => {
    try {
      setResetLoading(true);
      setResetError(null);
  const result = await ResetService.resetAll();
      setOpenReset(false);
      setResetSuccess(result.message || 'Reset tamamlandı');
  // Reset sonrası mevcut görünümü yeniden yükle
  taskStore.reloadCurrentView();
    } catch (e: any) {
      setResetError(e.message || 'Reset işlemi başarısız oldu.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          color: 'var(--text)'
        }
      }}
    >
      <Toolbar />
      <Box sx={{ overflowY: 'auto' }}>
        <List dense>
          {items.map(it => {
            const active = it.exact ? location.pathname === it.path : location.pathname.startsWith(it.path);
            return (
              <ListItemButton
                key={it.path}
                selected={active}
                onClick={() => { navigate(it.path); onClose(); }}
                sx={{
                  my: .3,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    background: 'rgba(148,163,184,.15)'
                  },
                  '&:hover': {
                    background: 'rgba(148,163,184,.10)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'var(--text)', minWidth: 36 }}>
                  {it.icon}
                </ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            );
          })}
          <Divider sx={{ my: 1, borderColor: 'var(--border)' }} />
          <ListItemButton
            onClick={handleOpenReset}
            sx={{
              my: .3,
              borderRadius: 1,
              '&:hover': { background: 'rgba(239,68,68,.12)' }
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text)', minWidth: 36 }}>
              <RestartAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Fabrika Ayarlarına Dön" />
          </ListItemButton>
        </List>
      </Box>
      <Dialog open={openReset} onClose={handleCloseReset} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> Veri Sıfırlama
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2">Tüm görevler ve kullanıcıyla ilişkili veriler geri dönülmez şekilde silinebilir.</Typography>
            <Typography variant="body2" sx={{ color: 'var(--danger)', fontWeight: 600 }}>Bu işlem geri alınamaz.</Typography>
            {resetError && (
              <Typography variant="body2" sx={{ color: 'error.main' }}>{resetError}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReset} disabled={resetLoading}>Vazgeç</Button>
          <Button onClick={handleConfirmReset} color="error" variant="contained" disabled={resetLoading}>
            {resetLoading ? 'Sıfırlanıyor...' : 'Sıfırla'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!resetSuccess}
        autoHideDuration={4000}
        onClose={() => setResetSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setResetSuccess(null)}>
          {resetSuccess}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default AppSidebar;
