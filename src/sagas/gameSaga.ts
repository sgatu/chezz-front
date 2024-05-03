import Api from "@/lib/api";
import Game from "@/lib/models/game";
import { createGame, getGame, createGameKo, createGameOk, getGameKo, getGameOk } from "@/reducers/gameReducer";
import { ChosenColor } from "@/types";
import { PayloadAction } from "@reduxjs/toolkit";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { getApi } from "./utils";

function* getGameSaga({ payload: gameId }: PayloadAction<string>) {
  const gameApi: Api = yield getApi();
  try {
    const game: Game = yield call([gameApi, gameApi.getGame], gameId);
    console.log(game);
    yield put(getGameOk(game));
  } catch (e) {
    let message: string = "Unknown error when creating game";
    if (e instanceof Error) message = e.message;
    yield put(getGameKo(message));
    console.log("Sagas Error: ", e);
  }
}

function* createGameSaga({ payload: color }: PayloadAction<ChosenColor>) {
  const gameApi: Api = yield getApi();
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
    takeLatest(getGame.type, getGameSaga),
    takeLatest(createGame.type, createGameSaga)
  ]);
}
