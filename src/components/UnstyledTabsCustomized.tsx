import * as React from 'react';
import { styled } from '@mui/system';
import { Tabs } from '@mui/base/Tabs';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { TabPanel as BaseTabPanel } from '@mui/base/TabPanel';
import { buttonClasses } from '@mui/base/Button';
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab';
import { departmentLabel, statusColorMap, statusLabel } from '../tasks/status';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../stores/taskStore';
import { Chip, Skeleton, Stack } from '@mui/material';

interface TaskTabsProps {
  taskId: number;
  defaultValue?: number;
}

const UnstyledTabsCustomized: React.FC<TaskTabsProps> = ({ taskId, defaultValue = 1 }) => {
  const task = taskStore.getTask(taskId);
  const { loading } = taskStore;

  if (loading && !task) {
    return (
      <Stack spacing={1} sx={{ maxWidth: 460 }}>
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={80} />
      </Stack>
    );
  }

  if (!task) {
    return <span style={{ opacity: 0.6, fontStyle: 'italic' }}>Görev bulunamadı</span>;
  }

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <Tab value={1}>ID</Tab>
        <Tab value={2}>Departman</Tab>
        <Tab value={3}>Oluşturan</Tab>
        <Tab value={4}>Durum</Tab>
      </TabsList>
             
         

      <TabPanel value={1}>{`#${task.id}`}</TabPanel>
      <TabPanel value={2}>{departmentLabel(task.assignedDepartment)}</TabPanel>
      <TabPanel value={3}>{task.user?.name || '—'}</TabPanel>
      <TabPanel value={4}>
        <Chip
          size="small"
          // color={statusColorMap[task.status]}
          label={statusLabel(task.status)}
        />
      </TabPanel>
    </Tabs>
  );
};

/*  Base CSS değişkenleri (base.css):v
    --panel, --border, --text, --primary
*/
const Tab = styled(BaseTab)`
  font-family: system-ui, 'Inter', sans-serif;
  color: var(--text);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  background: transparent;
  width: 100%;
  line-height: 1.35;
  padding: 8px 12px;
  margin: 4px;
  border: 1px solid transparent;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  letter-spacing: 0.3px;
  transition: background-color 0.17s, color 0.17s, border-color 0.17s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--border);
  }

  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15), 0 0 0 3px var(--primary);
  }

  &.${tabClasses.selected} {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  &.${buttonClasses.disabled} {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(BaseTabPanel)`
  width: 100%;
  max-width: 380px;
  font-family: system-ui, 'Inter', sans-serif;
  font-size: 1.5rem;
  padding: 4px 2px 2px;
  color: var(--text);
`;

const TabsList = styled(BaseTabsList)`
width: 200%;
  max-width: 600px;

  background: var(--panel);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px) saturate(140%);
  border-radius: 12px;
  margin-bottom: 14px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.04);
`;

export default observer(UnstyledTabsCustomized);