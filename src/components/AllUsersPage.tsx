import React from 'react';
import { Container, Typography, Paper, Stack } from '@mui/material';

const AllUsersPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper variant="outlined" sx={{ p: 3, background: 'var(--panel)', borderColor: 'var(--border)' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>Tüm Kullanıcılar</Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
            (Bu sayfa için kullanıcı listesi henüz uygulanmadı.)
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AllUsersPage;
