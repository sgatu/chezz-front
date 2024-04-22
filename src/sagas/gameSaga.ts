import Api from "@/lib/api";
import Game from "@/lib/models/game";
import { GET_GAME_BY_ID } from "@/reducers/gameReducer";
import { PayloadAction } from "@reduxjs/toolkit";
import { all, call, getContext, takeLatest } from "redux-saga/effects";



function* getGameSaga({ payload: gameId }: PayloadAction<string>) {
  const gameApi: Api = yield getContext("api");
  try {
    const game: Game = yield call([gameApi, gameApi.getGame], gameId);
    console.log(game);
  } catch (e) {
    console.log(e);
  }
}

export default function* games() {
  yield all([
    takeLatest(GET_GAME_BY_ID, getGameSaga)
  ]);
}
