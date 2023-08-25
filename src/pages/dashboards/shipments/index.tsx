// ** React Imports
import { useState, useEffect, MouseEvent, useCallback } from 'react';

// ** Next Imports
import Link from 'next/link';

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

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { ThemeColor } from 'src/@core/layouts/types';

// ** Custom Table Components Imports
import TableHeader from 'src/views/dashboards/shipments/filter/TableHeader';
import { ResponseShipment, fetchData, filterData } from 'src/store/apps/shipments';
import { connectToServer } from 'src/libs';

interface UserStatusType {
  [key: string]: ThemeColor;
}

interface CellType {
  row: ResponseShipment;
}

const userStatusObj: UserStatusType = {
  residential: 'success',
  business: 'secondary'
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
    maxWidth: 140,
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
    flex: 0.2,
    minWidth: 250,
    field: 'Destino',
    headerName: 'Destino',
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
    maxWidth: 100,
    headerName: 'CP',
    field: 'CP',
    renderCell: ({ row }: CellType) => {
      return (
        <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
          {row.coreData.zipCode}
        </Typography>
      );
    }
  },
  {
    flex: 0.15,
    field: 'comprador',
    minWidth: 150,
    headerName: 'Comprador',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.coreData.buyer}
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
    flex: 0.15,
    field: 'Origen',
    minWidth: 150,
    headerName: 'Origen',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.coreData.sellerAddress}
          </Typography>
        </Box>
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
  const [deliveryPreferences, setDeliveryPreferences] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [seller, setSeller] = useState<string>('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.shipment);

  useEffect(() => {
    connectToServer(dispatch);
    dispatch(
      fetchData()
    );

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    dispatch(filterData({
      allData: store.allData,
      params: {
        deliveryPreferences,
        seller,
        q: value,
        sellerAddress
      }
    }));

    // eslint-disable-next-line
  }, [dispatch, sellerAddress, deliveryPreferences, seller, value]);

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleDeliveryPreferenceChange = useCallback((e: SelectChangeEvent) => {
    setDeliveryPreferences(e.target.value);
  }, []);

  const handleAddressChange = useCallback((e: SelectChangeEvent) => {
    setSellerAddress(e.target.value);
  }, []);

  const handleSellerChange = useCallback((e: SelectChangeEvent) => {
    setSeller(e.target.value);
  }, []);

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Filtros de búsqueda' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='delivery-preference-select'>Tipo de envío</InputLabel>
                  <Select
                    fullWidth
                    value={deliveryPreferences}
                    id='select-delivery-preference'
                    label='Select Delivery Preference'
                    labelId='delivery-preference-select'
                    onChange={handleDeliveryPreferenceChange}
                    inputProps={{ placeholder: 'Origen' }}
                  >
                    <MenuItem value=''>Todos los tipos de envío</MenuItem>
                    <MenuItem value='residential'>Residential</MenuItem>
                    <MenuItem value='business'>Business</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='origin-select'>Origen</InputLabel>
                  <Select
                    fullWidth
                    value={sellerAddress}
                    id='select-origin'
                    label='Select Origin'
                    labelId='origin-select'
                    onChange={handleAddressChange}
                    inputProps={{ placeholder: 'Origen' }}
                  >
                    <MenuItem value=''>Todos los orígenes</MenuItem>
                    {store?.addressSelects?.sellerAddress.map((address) => (
                      <MenuItem key={address} value={address}>{address}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Vendedor</InputLabel>
                  <Select
                    fullWidth
                    value={seller}
                    id='select-seller'
                    label='Select Seller'
                    labelId='seller-select'
                    onChange={handleSellerChange}
                    inputProps={{ placeholder: 'Vendedor' }}
                  >
                    <MenuItem value=''>Todos los vendedores</MenuItem>
                    {store?.addressSelects?.seller.map((seller) => (
                      <MenuItem key={seller} value={seller}>{seller}</MenuItem>
                    ))}
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

export default ShipmentsDashboard;
