import React from 'react';
import { Box, Toolbar } from '@mui/material';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const SIDEBAR_WIDTH = 220;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleSidebar = () => setMobileOpen(o => !o);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar open={mobileOpen} onClose={toggleSidebar} width={SIDEBAR_WIDTH} variant="temporary" />

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppHeader onToggleSidebar={toggleSidebar} />
        <Box component="main" sx={{ p: 2 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
