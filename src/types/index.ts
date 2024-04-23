import GameModel from "@/lib/api/models/game";

export type ChosenColor = 'white' | 'black' | 'random';
export type PlayerColor = 'white' | 'black' | null;
export type PlayerGameRelation = 'white' | 'black' | 'observer';


export interface getGameStatus {
  inProgress: boolean,
  game?: GameModel,
  error?: string,
}

export interface createGameStatus {
  inProgress: boolean
  gameId?: string,
  error?: string
}

export interface gameState {
  getGame: getGameStatus,
  createGame: createGameStatus,
}

export interface RootState {
  game: gameState
}
