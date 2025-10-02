import React from 'react';
import { observer } from 'mobx-react';
import { authStore } from '../stores/authStore';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const ProfileMenu: React.FC = observer(() => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="profil menüsü">
        <Avatar sx={{ width: 28, height: 28 }}>
          {authStore.name ? authStore.name.charAt(0).toUpperCase() : <AccountCircleIcon fontSize="small" />}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Dashboard
        </MenuItem> */}
        <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Profilim
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); authStore.logout(); navigate('/'); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
});

export default ProfileMenu;
