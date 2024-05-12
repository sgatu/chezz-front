import { PieceType, Player } from "@/lib/models/game";

export type ChosenColor = 'white' | 'black' | 'random';
export type PlayerColor = 'white' | 'black' | null;
export type PlayerGameRelation = 'white' | 'black' | 'observer';

export const ServerMessageType = {
  MOVE: "move",
  ERROR: "error",
  INIT: "init"
} as const;

export type ServerMove = {
  type: typeof ServerMessageType.MOVE,
  uci: string,
  checkedPlayer: Player,
  mateStatus: string,
}
export type ServerMoveError = {
  type: typeof ServerMessageType.ERROR,
  error: string,
  code: string
}
export type ServerInit = {
  type: typeof ServerMessageType.INIT,
  relation: PlayerGameRelation
}
type TypedMessage = {
  type: string
}

export type ServerMessage = ServerMove | ServerMoveError | ServerInit;

function isType<T extends ServerMessage>(obj: unknown, type: string): obj is T {
  if ((obj as TypedMessage)?.type === undefined || typeof (obj as TypedMessage)?.type !== "string") {
    return false;
  }
  return (obj as TypedMessage).type === type;
}

export function parseServerMessage(json: string): ServerMessage | null {
  const obj = JSON.parse(json);
  if (isType<ServerMove>(obj, ServerMessageType.MOVE)) {
    return obj as ServerMove;
  } else if (isType<ServerMoveError>(obj, ServerMessageType.ERROR)) {
    return obj as ServerMoveError;
  } else if (isType<ServerInit>(obj, ServerMessageType.INIT)) {
    return obj as ServerInit;
  }
  return null
}

export function pieceTypeToChar(pType: PieceType): string {
  switch (pType) {
    case PieceType.KING:
      return "K";
    case PieceType.PAWN:
      return "P";
    case PieceType.ROOK:
      return "R";
    case PieceType.QUEEN:
      return "Q";
    case PieceType.BISHOP:
      return "B"
    case PieceType.KNIGHT:
      return "N";
    case PieceType.UNKNOWN:
      return "U";
  }
}
export function charToPieceType(c: string): PieceType {
  switch (c) {
    case "K":
      return PieceType.KING;
    case "P":
      return PieceType.PAWN;
    case "Q":
      return PieceType.QUEEN;
    case "R":
      return PieceType.ROOK;
    case "B":
      return PieceType.BISHOP;
    case "N":
      return PieceType.KNIGHT;
    default:
      return PieceType.UNKNOWN;
  }
}

