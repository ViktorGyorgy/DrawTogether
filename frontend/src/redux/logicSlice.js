import { createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client';

const initialState = {
  page: "",
  isLoggedIn: false,
  isAdmin: false,
  players: [],
  gamePhase: "",
  username: "",
}

let socket = null;
export {socket};


export const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    toLobby: (state) => {
        state.page = "lobby";
        
    },
    setIsLoggedIn: (state) => {
      state.isLoggedIn = true
      socket = io("localhost:80", {
        withCredentials: true,
      });
    },
    setLoggedOut: (state) => {
      state.isLoggedIn = false;
      socket.close()
    },
    setUsername: (state, action) =>{
      state.username = action.payload;
    },
    setGamePhase: (state, action) => {
      state.gamePhase = action.payload;
    },
    setAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { toLobby, setIsLoggedIn, setGamePhase, setAdmin, setPage, setLoggedOut, setUsername } = gameStateSlice.actions

export default gameStateSlice.reducer