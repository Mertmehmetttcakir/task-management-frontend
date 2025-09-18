import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { contextTabs } from '../../config/navigation';
import { taskStore } from '../../stores/taskStore';
import { observer } from 'mobx-react';

const ContextNav: React.FC = observer(() => {
  const location = useLocation();
  const tabs = contextTabs[location.pathname];
  if (!tabs) return null;

  // Only tasks root uses store view for now
  const value = location.pathname === '/' ? taskStore.view : tabs[0].value;

  const handleChange = (_: any, newValue: string) => {
    if (location.pathname === '/') {
      taskStore.setView(newValue as any);
      taskStore.load();
    }
  };

  return (
    <Box sx={{ borderBottom: '1px solid rgba(148,163,184,.15)', px: 2, background: 'var(--panel)' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        allowScrollButtonsMobile
        TabIndicatorProps={{ style: { height: 3 } }}
        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
      >
        {tabs.map(t => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>
    </Box>
  );
});

export default ContextNav;
