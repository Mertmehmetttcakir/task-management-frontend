import React from 'react';
import { observer } from 'mobx-react';
import { authStore } from '../stores/authStore';
import {
  Container,
  Stack,
  Typography,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BadgeIcon from '@mui/icons-material/Badge';
import { assignedDepartment, departmentLabel } from '../tasks/status';

const ProfilePage: React.FC = observer(() => {
  const initial = authStore.name?.charAt(0)?.toUpperCase();

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: 'var(--panel)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 56, height: 56 }}>
              {initial || <AccountCircleIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {authStore.name || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                {authStore.email || '—'}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: 'var(--border)' }} />

          <List sx={{ py: 0 }}>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--muted)' }}>
                <BadgeIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: 'var(--text)' }}>
                    {authStore.userId ?? '—'}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    Kullanıcı ID
                  </Typography>
                }
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--muted)' }}>
                <ApartmentIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: 'var(--text)' }}>
                    {departmentLabel(authStore.department as assignedDepartment) ?? '—'}
                  </Typography>
                }
                secondary={ 
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    Departman
                  </Typography>
                }
              />
            </ListItem> 
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--muted)' }}>
                <MailOutlineIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: 'var(--text)' }}>
                    {authStore.email || '—'}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    E-posta
                  </Typography>
                }
                />
            </ListItem>
          </List>
        </Stack>
      </Paper>
    </Container>
  );
});

export default ProfilePage;
