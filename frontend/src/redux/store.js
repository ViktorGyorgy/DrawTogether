import { configureStore } from '@reduxjs/toolkit'
import gameStateReducer from './logicSlice'

export const store = configureStore({
  reducer: {
    gameState: gameStateReducer
  },
})