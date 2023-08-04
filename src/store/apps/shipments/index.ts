// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

interface DataParams {
  q: string
  role: string
  status: string
  currentPlan: string
}

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

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
  seller: string
  address: string
  zipCode: string
  deliveryPreferences: string
}


// ** Fetch Users
export const fetchData = createAsyncThunk('appShipment/fetchData', async (params: DataParams) => {
  try {
    const response = await fetch('http://localhost:3001/shipments', {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    const obj: Shipment[] = await response.json();
    console.log(params);

    const responserr = await axios.get('/apps/users/list', {
      params
    })
    console.log(responserr.data)

    // return responserr.data
    const tata: ResponseShipment[] = obj.map((e) => {
      const bla = { id: e._id, ...e }; 

      return bla;
    })
    const responses = {
        allData: tata,
        users: tata,
        params: params,
        total: tata.length
      }

    console.log(responses)
    
    return responses as any;
  } catch (err) {
    console.log(err);
  }
})

// ** Add User
export const addUser = createAsyncThunk(
  'appShipment/addUser',
  async (data: { [key: string]: number | string }, { getState, dispatch }: Redux) => {
    const response = await axios.post('/apps/users/add-user', {
      data
    })
    dispatch(fetchData(getState().user.params))

    return response.data
  }
)

// ** Delete User
export const deleteUser = createAsyncThunk(
  'appShipment/deleteUser',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await axios.delete('/apps/users/delete', {
      data: id
    })
    dispatch(fetchData(getState().user.params))

    return response.data
  }
)

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
