import React from 'react';
import { AppBar, Toolbar, Typography, Stack, IconButton, Button, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProfileMenu from './ProfileMenu';
import { observer } from 'mobx-react';
import { authStore } from '../stores/authStore';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { primaryNav, contextTabs } from '../config/navigation';
import { taskStore } from '../stores/taskStore';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}
const AppHeader: React.FC<AppHeaderProps> = observer(({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  if (!authStore.isLoggedIn) return null;
  const handleNewTask = () => {
    window.dispatchEvent(new CustomEvent('task:new'));
  };
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(148,163,184,.15)', backdropFilter: 'saturate(140%) blur(2px)' }}>
      <Toolbar>
        {onToggleSidebar && (
          <IconButton edge="start" color="inherit" onClick={onToggleSidebar} sx={{ mr: 1 }} aria-label="menüyü aç">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ mr: 2 }}>
          Task Management
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {primaryNav.filter(n => n.showInHeader).map(item => {
            const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <Button
                key={item.path}
                size="small"
                onClick={() => navigate(item.path)}
                startIcon={item.icon as any}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.6,
                  height: 34,
                  background: active ? 'linear-gradient(90deg,var(--accent,#6366f1),#4f46e5)' : 'transparent',
                  color: active ? '#fff' : 'var(--text)',
                  boxShadow: active ? '0 2px 6px -2px rgba(79,70,229,.4)' : 'none',
                  border: active ? '1px solid rgba(255,255,255,.15)' : '1px solid rgba(148,163,184,.25)',
                  backdropFilter: active ? 'saturate(160%) blur(4px)' : 'none',
                  transition: 'all .25s',
                  '&:hover': {
                    background: active ? 'linear-gradient(90deg,var(--accent,#6366f1),#4f46e5)' : 'rgba(148,163,184,.15)',
                    boxShadow: active ? '0 3px 8px -2px rgba(79,70,229,.45)' : 'none'
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
        <Stack sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, ml: 2 }}>
          {contextTabs[location.pathname] && location.pathname === '/' && (
            <Tabs
              value={taskStore.view}
              onChange={(_, v) => { taskStore.setView(v); taskStore.load(); }}
              variant="scrollable"
              allowScrollButtonsMobile
              TabIndicatorProps={{ style: { display: 'none' } }}
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 40,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.8,
                  mr: 0.8,
                  alignItems: 'center',
                  background: 'rgba(148,163,184,.15)',
                  color: 'var(--text)',
                  transition: 'all .25s',
                },
                '& .MuiTab-root.Mui-selected': {
                  background: 'linear-gradient(90deg,var(--accent,#6366f1),#4f46e5)',
                  color: '#fff',
                  boxShadow: '0 2px 6px -2px rgba(79,70,229,.4)',
                  border: '1px solid rgba(255,255,255,.15)'
                },
                '& .MuiTab-root:hover': {
                  background: 'rgba(148,163,184,.25)'
                }
              }}
            >
              {contextTabs['/'].map(t => (
                <Tab key={t.value} value={t.value} label={t.label} />
              ))}
            </Tabs>
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {location.pathname === '/' && (
            <Button
              size="small"
              onClick={handleNewTask}
              startIcon={<AddIcon fontSize="small" />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 999,
                px: 1.8,
                height: 34,
                background: 'linear-gradient(90deg,#10b981,#059669)',
                color: '#fff',
                boxShadow: '0 2px 6px -2px rgba(16,185,129,.45)',
                border: '1px solid rgba(255,255,255,.12)',
                transition: 'all .25s',
                '&:hover': {
                  background: 'linear-gradient(90deg,#059669,#047857)',
                  boxShadow: '0 3px 9px -2px rgba(16,185,129,.55)'
                }
              }}
            >
              Yeni Görev
            </Button>
          )}
          <ProfileMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
});

export default AppHeader;
