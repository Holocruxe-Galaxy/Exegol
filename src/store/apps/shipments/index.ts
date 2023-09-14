// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface Shipment {
  _id: string
  coreData: CoreData
}

export interface ResponseShipment {
  _id: string
  id: string
  coreData: CoreData
}

export interface CoreData {
  id: number
  buyer: string
  address: string
  zipCode: string
  seller: string
  sellerAddress: string
  deliveryPreferences: string
  destinationLatitude: number;
  destinationLongitude: number;
  status: string;
  originLatitude?: number;
  originLongitude?: number;
  deliveryTime?: string
  order?: number | string;
  deliveryType?: string;
}

interface AddressSelects {
  seller: string[]
  deliveryTime: string[]
  sellerAddress: string[]
  status: string[]
}

interface ShipmentReducer {
  data: Shipment[]
  params: any
  total: number
  allData: Shipment[]
  addressSelects: AddressSelects
}

function populateAddressStates(data: Shipment[]): AddressSelects  {
  const sellerAddress: string[] = [];
  const deliveryTime: string[] = [];
  const seller: string[] = [];
  const status: string[] = [];

  data.map(({ coreData }) => {
    if(coreData.sellerAddress) {
      sellerAddress.includes(coreData.sellerAddress) || sellerAddress.push(coreData.sellerAddress)
    }
    if(coreData.deliveryTime) {
      deliveryTime.includes(coreData.deliveryTime) || deliveryTime.push(coreData.deliveryTime)
    }
      seller.includes(coreData.seller) || seller.push(coreData.seller)
      status.includes(coreData.status) || status.push(coreData.status)
  })
  
  return { sellerAddress, seller, deliveryTime, status }
}

// ** Fetch Users
export const fetchData = createAsyncThunk('appShipment/fetchData', async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK}/shipments`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    const shipments: Shipment[] = await response.json();

    const ShipmentsWithId: ResponseShipment[] = shipments.map((e) => {
      const withId = { id: e._id, ...e }; 

      return withId;
    })
    const addressSelects = populateAddressStates(shipments)

    const dispatchableData = {
      allData: ShipmentsWithId,
      shipments: ShipmentsWithId,
      total: ShipmentsWithId.length,
      addressSelects: addressSelects
    }
    
    return dispatchableData as any;
  } catch (err) {
    console.log(err);
  }
})

export const filterData = createAsyncThunk('appShipment/filterData', async (
  { allData, params }: Pick<ShipmentReducer, 'allData' | 'params'>
) => {
  const {
    q = '',
    deliveryPreferences = null,
    deliveryTime = null,
    seller = null,
    sellerAddress = null,
    status = null
  } = params ?? ''
  const queryLowered = q.toLowerCase();
  console.log(status)

  const filteredData = allData.filter(
    ({ coreData }) => (
      coreData.id.toString().includes(queryLowered) ||
      coreData.order?.toString().includes(queryLowered) ||
      coreData.seller.toLowerCase().includes(queryLowered) ||
      coreData.status.toLowerCase().includes(queryLowered) ||
      coreData.address.toLowerCase().includes(queryLowered) ||
      coreData.deliveryPreferences.toLowerCase().includes(queryLowered) ||
      (coreData.deliveryTime && coreData.deliveryTime.toLowerCase().includes(queryLowered))
    ) &&
      coreData.deliveryTime === (deliveryTime || coreData.deliveryTime) &&
      coreData.deliveryPreferences === (deliveryPreferences || coreData.deliveryPreferences) &&
      coreData.sellerAddress === (sellerAddress || coreData.sellerAddress) &&
      coreData.seller === (seller || coreData.seller) &&
      coreData.status === (status || coreData.status)
  )
  
  return filteredData as Shipment[]
})

export const appShipmentsSlice = createSlice({
  name: 'appShipment',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: [],
    addressSelects: { seller: [], sellerAddress: [], deliveryTime: [], status: [] }
  } as ShipmentReducer,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
      state.addressSelects = action.payload.addressSelects
    })
    builder.addCase(filterData.fulfilled, (state, action) => {
      state.data = action.payload
    })
  }
})

export default appShipmentsSlice.reducer
