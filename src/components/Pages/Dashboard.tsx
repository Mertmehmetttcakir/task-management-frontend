import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Skeleton,
  IconButton,
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../../stores/taskStore';
import { statusLabel, statusColorMap } from '../../tasks/status';
import { useNavigate } from 'react-router-dom';
import { PieChart } from '@mui/x-charts';
import { BarChart  } from '@mui/x-charts/BarChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';

const Dashboard: React.FC = observer(() => {
  const { tasks, loading, error } = taskStore;
  const [usePieChart, setUsePieChart] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tasks.length && !loading) {
      taskStore.load().catch(() => {});
    }
  }, [tasks.length, loading]);




  const metrics = useMemo(() => {
    const counts = { total: tasks.length, pending: 0, approved: 0, rejected: 0 };
    tasks.forEach(t => {

      if (t.status === 0) counts.pending++;
      else if (t.status === 1) counts.approved++; 
      else counts.rejected++;
    });
    return counts;
  }, [tasks]);

  const depsmetric = useMemo(() => {
    const dep = { Pending: 0, Approved: 0, Rejected: 0 };
    const stat ={
      HR: {...dep},
      Sales: {...dep},
      Finance: {...dep}
    }
    tasks.forEach(t => {
      const depKey = t.status === 0 ? 'Pending' : t.status === 1 ? 'Approved' : 'Rejected';
      if (t.assignedDepartment === 0) stat.Sales[depKey]++;
      else if(t.assignedDepartment === 1) stat.HR[depKey]++;
      else if (t.assignedDepartment === 2) stat.Finance[depKey]++;
    });
    return stat;
  }, [tasks]);

    const pieData = useMemo(() => [
    {id: 0, label: 'Bekleyen', value: metrics.pending , color: '#ff7e06ff'},
    {id: 1, label: 'Onaylanan', value: metrics.approved, color: '#1233c3f6'},
    {id: 2, label: 'Reddedilen', value: metrics.rejected , color: '#e60b0bfc'},
  ].filter(d => d.value > 0), [metrics]);
    

  const recent = useMemo( 
    () => [...tasks].sort((a, b) => b.id - a.id).slice(0, 5), /* Son 5 görevi al [...task] kopyasını alıyor */
    [tasks]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={600}>Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<ListAltIcon />} variant="outlined" onClick={() => navigate('/tasks')}>
            Görevler
          </Button>
            {/* <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/tasks?create=1')}>
              Yeni Görev
            </Button> */}
        </Stack>
      </Stack>

      {error && (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', background: 'rgba(244,67,54,0.05)' }}>
          <Typography variant="body2" color="error">Görevler yüklenirken hata: {error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MetricCard label="Toplam" value={metrics.total} color="default" loading={loading} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard label="Bekleyen" value={metrics.pending} color={statusColorMap[0]} loading={loading} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard label="Onaylanan" value={metrics.approved} color={statusColorMap[1]} loading={loading} />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard label="Reddedilen" value={metrics.rejected} color={statusColorMap[2]} loading={loading} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600}>Son Görevler</Typography>
              <Button size="small" onClick={() => navigate('/tasks')} sx={{ textTransform: 'none' }}>
                Hepsi
              </Button>
            </Stack>
            <Divider />
            <Stack spacing={1}>
              {loading && !tasks.length && (
                <>
                  <Skeleton variant="rounded" height={40} />
                  <Skeleton variant="rounded" height={40} />
                  <Skeleton variant="rounded" height={40} />
                </>
              )}
              {!loading && !recent.length && (
                <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic' }}>Kayıt yok</Typography>
              )}
              {recent.map(t => (
                <Paper
                  key={t.id}
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => navigate(`/tasks/detail/${t.id}`)}
                >
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                    #{t.id} {t.title}
                  </Typography>
                  <Chip size="small" color={statusColorMap[t.status]} label={statusLabel(t.status)} />
                </Paper>
              ))}
            </Stack>
          </Paper>
        
        </Grid>
        {/* <Grid container spacing={2} > */}

              <Grid item xs={12} md={6}>
          <Paper variant = 'outlined' sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-end' }}>
              <Button size='small' variant={usePieChart ? 'outlined' : 'contained'} startIcon={<BarChartIcon />} onClick={() => setUsePieChart(false)}>
                BarChart
              </Button>
              <Button size='small' variant={usePieChart ? 'contained' : 'outlined'} startIcon={<PieChartOutlineIcon />} onClick={() => setUsePieChart(true)}>
                PieChart
              </Button>
            </Stack>
            <Typography variant="subtitle1" fontWeight={600}> {usePieChart ? 'Durum Dağılımı' : 'Departman Bazında Dağılım'} </Typography>
              <Divider />
              {usePieChart ? (
                metrics.total === 0  || pieData.length === 0 ? (
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic' }}>Kayıt yok</Typography>
                ) : (
                    <PieChart
                  height={240}
                  series={[{ innerRadius: 50, paddingAngle: 2, arcLabel: (item) => {
                         const total = pieData.reduce((a,b)=>a + b.value, 0);
                         return total ? `${(item.value/total*100).toFixed(0)}%` : '';
                         }, arcLabelRadius: '65%', data: pieData }]}
                  slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'right' } } }}
                />
              )
            ) : (
              <BarChart
              height={300}
              xAxis={[{ scaleType: 'band', data: ['HR','SALES','FINANCE']}]}
              yAxis={[{ scaleType: 'linear',  tickMinStep: 1 /* 1'er 1'er artıyor */ }]}
              series={[{
                    label: 'Bekleyen',
                    data: [
                      depsmetric.HR.Pending,
                      depsmetric.Sales.Pending,
                      depsmetric.Finance.Pending
                    ],
                    color: '#ff7e06ff'
                  },
                  {
                    label: 'Onaylanan',
                    data: [
                      depsmetric.HR.Approved,
                      depsmetric.Sales.Approved,
                      depsmetric.Finance.Approved
                    ],
                    color: '#2e7d32'
                  },
                  {
                    label: 'Reddedilen',
                    data: [
                      depsmetric.HR.Rejected,
                      depsmetric.Sales.Rejected,
                      depsmetric.Finance.Rejected
                    ],
                    color: '#d32f2f'
                  }
                ]}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* </Grid> */}
    </Box>
    
  );
});

interface MetricCardProps {
  label: string;
  value: number;
  color: string;
  loading: boolean;
}
const MetricCard: React.FC<MetricCardProps> = ({ label, value, color, loading }) => (
  <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 110 }}>
    <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: .5, opacity: .75 }}>
      {label.toUpperCase()}
    </Typography>
    {loading ? <Skeleton variant="text" width={60} height={42} /> : <Typography variant="h5" fontWeight={600}>{value}</Typography>}
    <Box flexGrow={1} />
    <Chip
      size="small"
      label={loading ? '...' : (value === 0 ? 'Yok' : `${value} adet`)}
      color={(color === 'default' ? 'default' : (color as any))}
      variant="outlined"
      sx={{ alignSelf: 'flex-start' }}
    />
  </Paper>
);



export default Dashboard;