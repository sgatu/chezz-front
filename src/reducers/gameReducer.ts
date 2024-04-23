import GameModel from "@/lib/api/models/game";
import { ChosenColor, gameState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const GAMESTORE = "game";
export type GAMESTORE = typeof GAMESTORE;
export const GET_GAME_BY_ID = `${GAMESTORE}/getGame`;
export type GET_GAME_BY_ID = typeof GET_GAME_BY_ID;
export const CREATE_GAME = `${GAMESTORE}/createGame`;
export type CREATE_GAME = typeof CREATE_GAME;
export const CREATE_GAME_OK = `${GAMESTORE}/createGameOk`;
export type CREATE_GAME_OK = typeof CREATE_GAME_OK;

const initialState: gameState = {
  getGame: { inProgress: false, },
  createGame: { inProgress: false, }
}

const gameReducer = createSlice({
  name: GAMESTORE,
  initialState,
  reducers: {

    getGame: (state, _payload: PayloadAction<string>) => {
      state.getGame.inProgress = true;
    },
    getGameOk: (state, { payload: game }: PayloadAction<GameModel>) => {
      state.getGame.game = game;
      state.getGame.error = undefined;
      state.getGame.inProgress = false;
    },
    getGameKo: (state, { payload: error }: PayloadAction<string>) => {
      state.getGame.game = undefined;
      state.getGame.inProgress = false;
      state.getGame.error = error;
    },
    createGame: (state, { payload: _color }: PayloadAction<ChosenColor>) => {
      state.createGame.inProgress = true;
    },
    createGameOk: (state, { payload: gameId }: PayloadAction<string>) => {
      state.createGame.inProgress = false;
      state.createGame.gameId = gameId;
      state.createGame.error = undefined;
    },
    createGameKo: (state, { payload: error }: PayloadAction<string>) => {
      state.createGame.inProgress = false;
      state.createGame.gameId = undefined;
      state.createGame.error = error;
    }
  }
});
export const { getGame, getGameOk, getGameKo, createGame, createGameOk, createGameKo } = gameReducer.actions;
export default gameReducer;
