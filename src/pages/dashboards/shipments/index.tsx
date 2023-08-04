// ** React Imports
import { useState, useEffect, MouseEvent, useCallback } from 'react';

// ** Next Imports
import Link from 'next/link';
import { GetStaticProps } from 'next/types';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip';

// ** Actions Imports
import { deleteUser } from 'src/store/apps/user';

// ** Third Party Components
import axios from 'axios';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { CardStatsType } from 'src/@fake-db/types';
import { ThemeColor } from 'src/@core/layouts/types';

// ** Custom Table Components Imports
import TableHeader from 'src/views/dashboards/shipments/filter/TableHeader';
import { ResponseShipment, fetchData } from 'src/store/apps/shipments';

interface UserStatusType {
  [key: string]: ThemeColor;
}

interface CellType {
  row: ResponseShipment;
}

const userStatusObj: UserStatusType = {
  residential: 'success',
  business: 'primary'
};

const RowOptions = ({ id }: { id: number | string; }) => {
  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();

  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const rowOptionsOpen = Boolean(anchorEl);

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleRowOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    dispatch(deleteUser(id));
    handleRowOptionsClose();
  };

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='mdi:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          onClick={handleRowOptionsClose}
          href='/apps/user/view/overview/'
        >
          <Icon icon='mdi:eye-outline' fontSize={20} />
          View
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='mdi:pencil-outline' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='mdi:delete-outline' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

const columns: GridColDef[] = [
  {
    flex: 0.2,
    minWidth: 230,
    field: 'códigoDeEnvío',
    headerName: 'Código de envío',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <Typography noWrap variant='caption'>
            {`${row.coreData.id}`}
          </Typography>
        </Box>
      );
    }
  },
  {
    flex: 0.15,
    field: 'vendedeor',
    minWidth: 150,
    headerName: 'Vendedor',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.coreData.seller}
          </Typography>
        </Box>
      );
    }
  },
  {
    flex: 0.2,
    minWidth: 250,
    field: 'dirección',
    headerName: 'Dirección',
    renderCell: ({ row }: CellType) => {
      return (
        <Typography noWrap variant='body2'>
          {row.coreData.address}
        </Typography>
      );
    }
  },
  {
    flex: 0.15,
    minWidth: 120,
    headerName: 'código Postal',
    field: 'Código Postal',
    renderCell: ({ row }: CellType) => {
      return (
        <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
          {row.coreData.zipCode}
        </Typography>
      );
    }
  },
  {
    flex: 0.1,
    minWidth: 110,
    field: 'envío',
    headerName: 'Envío',
    renderCell: ({ row }: CellType) => {
      return (
        <CustomChip
          skin='light'
          size='small'
          label={row.coreData.deliveryPreferences}
          color={userStatusObj[row.coreData.deliveryPreferences] || 'warning'}
          sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
        />
      );
    }
  },
  {
    flex: 0.1,
    minWidth: 90,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
  }
];

const ShipmentsDashboard = () => {
  // ** State
  const [role, setRole] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.shipment);

  useEffect(() => {
    dispatch(
      fetchData({
        role,
        status,
        q: value,
        currentPlan: plan
      })
    );
  }, [dispatch, plan, role, status, value]);

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleRoleChange = useCallback((e: SelectChangeEvent) => {
    setRole(e.target.value);
  }, []);

  const handlePlanChange = useCallback((e: SelectChangeEvent) => {
    setPlan(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: SelectChangeEvent) => {
    setStatus(e.target.value);
  }, []);

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='role-select'>Select Role</InputLabel>
                  <Select
                    fullWidth
                    value={role}
                    id='select-role'
                    label='Select Role'
                    labelId='role-select'
                    onChange={handleRoleChange}
                    inputProps={{ placeholder: 'Select Role' }}
                  >
                    <MenuItem value=''>Select Role</MenuItem>
                    <MenuItem value='admin'>Admin</MenuItem>
                    <MenuItem value='author'>Author</MenuItem>
                    <MenuItem value='editor'>Editor</MenuItem>
                    <MenuItem value='maintainer'>Maintainer</MenuItem>
                    <MenuItem value='subscriber'>Subscriber</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='plan-select'>Select Plan</InputLabel>
                  <Select
                    fullWidth
                    value={plan}
                    id='select-plan'
                    label='Select Plan'
                    labelId='plan-select'
                    onChange={handlePlanChange}
                    inputProps={{ placeholder: 'Select Plan' }}
                  >
                    <MenuItem value=''>Select Plan</MenuItem>
                    <MenuItem value='basic'>Basic</MenuItem>
                    <MenuItem value='company'>Company</MenuItem>
                    <MenuItem value='enterprise'>Enterprise</MenuItem>
                    <MenuItem value='team'>Team</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Select Status</InputLabel>
                  <Select
                    fullWidth
                    value={status}
                    id='select-status'
                    label='Select Status'
                    labelId='status-select'
                    onChange={handleStatusChange}
                    inputProps={{ placeholder: 'Select Role' }}
                  >
                    <MenuItem value=''>Select Role</MenuItem>
                    <MenuItem value='pending'>Pending</MenuItem>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <TableHeader value={value} handleFilter={handleFilter} />
          <DataGrid
            autoHeight
            rows={store.data}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('/cards/statistics');

  // try {
  //   const tres = await fetch('http://localhost:3001/shipments', {
  //     headers: { 'Content-Type': 'application/json' },
  //     method: 'GET',
  //   });
  //   const obj = await tres.json();
  //   console.log(obj);
  // } catch (err) {
  //   console.log(err);
  // }
  const apiData: CardStatsType = res.data;

  return {
    props: {
      apiData
    }
  };
};

export default ShipmentsDashboard;
