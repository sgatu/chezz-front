import Api from "@/lib/api";
import Game from "@/lib/models/game";
import { CREATE_GAME, GET_GAME_BY_ID, createGameKo, createGameOk } from "@/reducers/gameReducer";
import { ChosenColor } from "@/types";
import { PayloadAction } from "@reduxjs/toolkit";
import { all, call, getContext, put, takeLatest } from "redux-saga/effects";



function* getGameSaga({ payload: gameId }: PayloadAction<string>) {
  const gameApi: Api = yield getContext("api");
  try {
    const game: Game = yield call([gameApi, gameApi.getGame], gameId);
    console.log(game);
  } catch (e) {
    console.log("Sagas Error: ", e);
  }
}

function* createGameSaga({ payload: color }: PayloadAction<ChosenColor>) {
  const gameApi: Api = yield getContext("api");
  try {
    const gameId: string = yield call([gameApi, gameApi.createGame], color);
    yield put(createGameOk(gameId));
  } catch (e) {
    let message: string = "Unknown error when creating game";
    if (e instanceof Error) message = e.message;
    yield put(createGameKo(message));
    console.log("Sagas error: ", e);
  }
}

export default function* games() {
  yield all([
    takeLatest(GET_GAME_BY_ID, getGameSaga),
    takeLatest(CREATE_GAME, createGameSaga)
  ]);
}
