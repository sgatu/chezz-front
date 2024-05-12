import Game from "@/lib/models/game";
import { ChosenColor } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const GAMESTORE = "game";

export interface GetGameState {
  inProgress: boolean,
  game?: Game,
  error?: string,
}

export interface CreateGameState {
  inProgress: boolean
  gameId?: string,
  error?: string
}

export interface gameState {
  getGame: GetGameState,
  createGame: CreateGameState,
}



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
    getGameOk: (state, { payload: game }: PayloadAction<Game>) => {
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
