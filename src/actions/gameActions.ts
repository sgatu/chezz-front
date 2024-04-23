import GameModel from "@/lib/api/models/game"

export enum GameActionKind {
  GET_GAME_ACTION,
  GET_GAME_ACTION_OK,
  GET_GAME_ACTION_KO,
  CREATE_GAME_ACTION,
  CREATE_GAME_ACTION_OK,
  CREATE_GAME_ACTION_KO,
}

export interface GetGameAction {
  type: GameActionKind.GET_GAME_ACTION,
  gameId: string,
}
export interface GetGameActionOk {
  type: GameActionKind.GET_GAME_ACTION_OK,
  game: GameModel,
}

export interface GetGameActionKo {
  type: GameActionKind.GET_GAME_ACTION_KO,
  error: string,
}

export interface CreateGameAction {
  type: GameActionKind.CREATE_GAME_ACTION,
  player: 'black' | 'white' | 'random',
}

export interface CreateGameActionOk {
  type: GameActionKind.CREATE_GAME_ACTION_OK,
}
export interface CreateGameActionKo {
  type: GameActionKind.CREATE_GAME_ACTION_KO,
  error: string
}
type GameActionType = GetGameAction | GetGameActionOk | GetGameActionKo | CreateGameAction | CreateGameActionOk | CreateGameActionKo;
export default GameActionType;
