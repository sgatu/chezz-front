import { all, spawn } from 'redux-saga/effects';
import gameSaga from './gameSaga'

const sagas = [
  gameSaga
];
export default function* rootSaga() {
  yield all(sagas.map(saga => spawn(saga)));
}
