import GameActionType, { GameActionKind } from "@/actions/gameActions";
import GameModel from "@/lib/api/models/game";

interface getGame {
  inProgress: boolean,
  game?: GameModel,
  error?: string,
}

interface createGame {
  inProgress: boolean
  ok?: boolean,
  error?: string
}

interface gameState {
  getGame: getGame,
  createGame: createGame,
}

const initialState: gameState = {
  getGame: { inProgress: false, },
  createGame: { inProgress: false, }
}

export default function(state: gameState = initialState, action: GameActionType): gameState {
  switch (action.type) {
    case GameActionKind.GET_GAME_ACTION:
      return {
        ...state,
        getGame: { inProgress: true }
      }
    case GameActionKind.GET_GAME_ACTION_OK:
      return {
        ...state,
        getGame: { ...state.getGame, inProgress: false, game: action.game, error: undefined }
      }
    case GameActionKind.GET_GAME_ACTION_KO:
      return {
        ...state,
        getGame: { ...state.getGame, inProgress: false, game: undefined, error: action.error }
      }
    case GameActionKind.CREATE_GAME_ACTION:
      return {
        ...state,
        createGame: { inProgress: true }
      }

    case GameActionKind.CREATE_GAME_ACTION_OK:
      return {
        ...state,
        createGame: { inProgress: false, ok: true, error: undefined }
      }
    case GameActionKind.CREATE_GAME_ACTION_KO:
      return {
        ...state,
        createGame: { inProgress: false, ok: false, error: action.error }
      }
    default:
      return state;

  }
}
