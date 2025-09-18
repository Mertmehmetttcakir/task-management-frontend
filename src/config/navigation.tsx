import React from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  exact?: boolean;
  showInHeader?: boolean;
  showInSidebar?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: 'Görevler', path: '/', icon: <AssignmentIcon fontSize="small" />, exact: true, showInHeader: true, showInSidebar: true },
  { label: 'Profil', path: '/profile', icon: <PersonIcon fontSize="small" />, showInHeader: true, showInSidebar: true },
  { label: 'Kullanıcılar', path: '/users', icon: <GroupIcon fontSize="small" />, showInHeader: false, showInSidebar: true },
];

export interface ContextTab { label: string; value: string; }
export const contextTabs: Record<string, ContextTab[]> = {
  '/': [
    { label: 'Tümü', value: 'all' },
    { label: 'Benim', value: 'mine' },
    { label: 'Departmanım', value: 'dept' },
  ],
};
