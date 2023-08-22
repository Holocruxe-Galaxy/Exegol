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
}


// ** Fetch Users
export const fetchData = createAsyncThunk('appShipment/fetchData', async () => {
  try {
    // const response = await fetch('https://serenno-production.up.railway.app/shipments', {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK}/shipments`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    const shipments: Shipment[] = await response.json();

    const ShipmentsWithId: ResponseShipment[] = shipments.map((e) => {
      const withId = { id: e._id, ...e }; 

      return withId;
    })

    const dispatchableData = {
        allData: ShipmentsWithId,
        users: ShipmentsWithId,
        total: ShipmentsWithId.length
      }
    
    return dispatchableData as any;
  } catch (err) {
    console.log(err);
  }
})

export const appShipmentsSlice = createSlice({
  name: 'appShipment',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.users
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appShipmentsSlice.reducer
