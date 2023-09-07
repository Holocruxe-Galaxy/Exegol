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
  deliveryTime?: string
}

interface AddressSelects {
  seller: string[]
  sellerAddress: string[]
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
  const seller: string[] = [];

  data.map(({ coreData }) => {
    if(coreData.sellerAddress) {
      sellerAddress.includes(coreData.sellerAddress) || sellerAddress.push(coreData.sellerAddress)
    }
      seller.includes(coreData.seller) || seller.push(coreData.seller)
  })
  
return { sellerAddress, seller }
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
  const { q = '', deliveryPreferences = null, seller = null, sellerAddress = null } = params ?? ''
  const queryLowered = q.toLowerCase();

  const filteredData = allData.filter(
    ({ coreData }) => (
      coreData.seller.toLowerCase().includes(queryLowered) ||
      coreData.address.toLowerCase().includes(queryLowered) ||
      coreData.deliveryPreferences.toLowerCase().includes(queryLowered) ||
      (coreData.deliveryTime && coreData.deliveryTime.toLowerCase().includes(queryLowered))
    ) &&
      coreData.deliveryPreferences === (deliveryPreferences || coreData.deliveryPreferences) &&
      coreData.sellerAddress === (sellerAddress || coreData.sellerAddress) &&
      coreData.seller === (seller || coreData.seller)
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
    addressSelects: { seller: [], sellerAddress: [] }
  } as ShipmentReducer,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.shipments
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
