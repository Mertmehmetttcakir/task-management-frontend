import React from 'react';
import { Box } from '@mui/material';
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar open={mobileOpen} onClose={toggleSidebar} width={SIDEBAR_WIDTH} variant="temporary" />

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppHeader onToggleSidebar={toggleSidebar} />
        <Box
          component="main"
          className="app-scroll-area"
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 1.5, md: 2 },
            pt: { xs: 2, md: 2 },
            scrollBehavior: 'smooth'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
