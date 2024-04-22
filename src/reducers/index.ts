import { combineSlices } from '@reduxjs/toolkit';
import gameReducer from './gameReducer';

export default combineSlices(gameReducer);
