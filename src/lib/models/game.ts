type relation = 'observer' | 'black' | 'white';

export enum PieceType {
  UNKNOWN,
  PAWN,
  BISHOP,
  KNIGHT,
  ROOK,
  QUEEN,
  KING
}

export enum Player {
  WHITE_PLAYER,
  BLACK_PLAYER,
  UNKNOWN_PLAYER
}

type Piece = {
  player: Player,
  pieceType: PieceType,
  hasBeenMoved: boolean,
}

export class GameStatus {
  table: (Piece | null)[];
  moves: string[];
  outTable: Piece[];
  playerTurn: Player;
  checkMate: boolean;
  isWhiteChecked: boolean;
  isBlackChecked: boolean;
  constructor(table: (Piece | null)[], outTable: Piece[], moves: string[], playerTurn: Player, checkMate: boolean, isWhiteChecked: boolean, isBlackChecked: boolean) {
    this.table = table;
    this.moves = moves;
    this.outTable = outTable;
    this.playerTurn = playerTurn;
    this.checkMate = checkMate;
    this.isWhiteChecked = isWhiteChecked;
    this.isBlackChecked = isBlackChecked;
  }
  private static pieceFromByte(b: number): Piece | null {
    let player: Player = Player.WHITE_PLAYER;
    let hasBeenMoved = false;
    if (b > 12) {
      player = Player.BLACK_PLAYER;
      b -= 12;
    }
    if (b > 6) {
      hasBeenMoved = true;
      b -= 6;
      if (b > 6) {
        return null;
      }
    }
    return {
      player: player,
      hasBeenMoved: hasBeenMoved,
      pieceType: <PieceType>b
    };
  }
  private static positionToCoordinates(position: number): string | null {
    if (position < 0 || position > 63) {
      return null;
    }
    const row = "abcdefgh"[position % 8];
    const column = Math.floor(position / 8) + 1;
    return row + column;
  }
  private static bytesToMove(startPos: number, endPos: number): string | null {
    const startCoord = GameStatus.positionToCoordinates(startPos);
    const endCoord = GameStatus.positionToCoordinates(endPos);
    if (startCoord == null || endCoord == null) {
      return null;
    }
    return startCoord + endCoord;
  }

  public static fromSerialized(data: Uint8Array): GameStatus {
    const pieces: (Piece | null)[] = [];
    const outPieces: Piece[] = [];
    let playerTurn = Player.WHITE_PLAYER;
    let readingMoves = false;
    const movementHistory: string[] = [];
    let startPos = -1;
    let endPos = -1;
    data.forEach((b, i) => {
      //first byte is defining the player turn
      if (i === 0) {
        playerTurn = b === 1 ? Player.BLACK_PLAYER : Player.WHITE_PLAYER;
        return;
      }
      //next 64 bytes are used to define the game table status
      if (i < 65) {
        pieces[i - 1] = b === 0 ? null : GameStatus.pieceFromByte(b);
        return;
      }
      // next we'll have to read the pieces that are out of the table untill we find a 0 byte
      // that will separate the pieces out of the table from the movement history
      if (b === 0 && !readingMoves) {
        readingMoves = true;
        return;
      }
      //reading out of the table pieces
      if (b !== 0 && !readingMoves) {
        const piece = GameStatus.pieceFromByte(b);
        if (piece !== null) {
          outPieces.push(piece);
        }
        return;
      }
      //reading movement history
      if (startPos === -1) {
        startPos = b;
        return;
      }
      endPos = b;
      const movement = GameStatus.bytesToMove(startPos, endPos);
      if (movement !== null) {
        movementHistory.push(movement);
      }
      startPos = -1;
    });
    return new GameStatus(pieces, outPieces, movementHistory, playerTurn, false, false, false);
  }
}

export default class Game {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  relation: relation;
  gameStatus: GameStatus;

  constructor(id: string, whitePlayer: string, blackPlayer: string, relation: relation, gameStatus: GameStatus) {
    this.id = id;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.relation = relation;
    this.gameStatus = gameStatus;
  }
}
