import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Stack, TableContainer, Table, TableHead , TableBody, TableCell,TableRow} from '@mui/material';
import { TaskUserDto, TaskService } from '../services/TaskService';
import { assignedDepartment, departmentLabel } from '../tasks/status';



const AllUsersPage: React.FC = () => {

const [users, setUsers] = useState<TaskUserDto[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let alive = true;
  (async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await(TaskService.AllUser ());
      if (alive) setUsers(data);
    } catch (e: any) {
      if (alive) setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      if (alive) setLoading(false);
    }
  })();
  return () => { alive = false; };
}, []);

console.log("loading:", loading, "error:", error, "users:", users);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper variant="outlined" sx={{ p: 3, background: 'var(--panel)', borderColor: 'var(--border)' , color: 'var(--text)', borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>Tüm Kullanıcılar</Typography>
               {loading && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                      Yükleniyor...
                    </Typography>
                  )}
                  {!loading && error && (
                    <Typography variant="body2" color="error" sx={{ py: 2 }}>
                      {error}
                    </Typography>
                  )}
                  {!loading && !error && users.length === 0 && (
                    <Typography variant="body2" sx={{ color: 'text.primary', py: 2 }}>
                      Kullanıcı bulunamadı.
                    </Typography>
                  )}
            {!loading && !error && users.length > 0 && (
              <TableContainer>
                <Table size='small' sx={{ '& td, & th': { color: 'white' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: 80 }}  >ID</TableCell>
                      <TableCell>İsim</TableCell>
                      <TableCell>Mail</TableCell>
                      <TableCell>Departman</TableCell>

                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => (  
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{departmentLabel(user.department)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
             
                </Table>
              </TableContainer>
            )} 
        </Stack>
      </Paper>
    </Container>
  );
};

export default AllUsersPage;
