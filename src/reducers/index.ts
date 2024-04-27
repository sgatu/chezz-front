import { combineSlices } from '@reduxjs/toolkit';
import gameReducer, { gameState } from './gameReducer';

export interface RootStateType {
  game: gameState
}

export default combineSlices(gameReducer);
