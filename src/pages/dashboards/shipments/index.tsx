// ** React Imports
import { MouseEvent, useState, useEffect, useCallback } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { ThemeColor } from 'src/@core/layouts/types';

// ** Custom Table Components Imports
import TableHeader from 'src/views/dashboards/shipments/filter/TableHeader';

import { connectToServer } from 'src/libs/socket.io';

import { CoreData, ResponseShipment, fetchData, filterData } from 'src/store/apps/shipments';
import { fileExporter } from 'src/libs/xlsx/xlsx';


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

const columns: GridColDef[] = [
  {
    flex: 0.2,
    maxWidth: 160,
    field: 'códigoDeEnvío',
    sortable: false,
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
    sortable: false,
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
    headerName: 'Zip',
    field: 'Zip',
    sortable: false,
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
    sortable: false,
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
    sortable: false,
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
    sortable: false,
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
    sortable: false,
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
  }
];

const ShipmentsDashboard = () => {
  // ** State
  const [deliveryPreferences, setDeliveryPreferences] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [seller, setSeller] = useState<string>('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const apiRef = useGridApiRef();

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

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    const selectedRows = apiRef.current.getSelectedRows();
    const toExport: CoreData[] = [];

    selectedRows.forEach((row) => toExport.push(row.coreData));
    if (!toExport.length) return;

    const formattedData = fileExporter.formatData(toExport);

    fileExporter.export(formattedData);
  };

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
          <Grid sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginRight: 8
          }} >
            <TableHeader value={value} handleFilter={handleFilter} />
            <Button
              onClick={(e) => onClick(e)}
              sx={{
                marginLeft: 4,
                backgroundColor: 'primary.main',
                color: '#FFF',
                mb: 2
              }}
            >Exportar</Button>
          </Grid>
          <DataGrid
            autoHeight
            rows={store.data}
            columns={columns}
            apiRef={apiRef}
            checkboxSelection
            disableColumnMenu={true}
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
