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

export type Piece = {
  player: Player,
  pieceType: PieceType,
  hasBeenMoved: boolean,
}
export type CastleRights = {
  blackQueenSide: boolean,
  blackKingSide: boolean,
  whiteQueenSide: boolean,
  whiteKingSide: boolean
}
export enum GameStatus {
  PLAYING = "",
  CHECKMATE = "#",
  STALEMATE = "-"
}
export class GameState {
  table: (Piece | null)[];
  moves: string[];
  outTable: Piece[];
  playerTurn: Player;
  gameStatus: GameStatus;
  checkedPlayer: Player;
  castleRights: CastleRights;
  lastMovementWasAPJump: boolean;
  constructor(
    table: (Piece | null)[],
    outTable: Piece[],
    moves: string[],
    playerTurn: Player,
    gameStatus: GameStatus,
    checkedPlayer: Player,
    castleRights: CastleRights,
    lastMovementWasAPJump: boolean,
  ) {
    this.table = table;
    this.moves = moves;
    this.outTable = outTable;
    this.playerTurn = playerTurn;
    this.gameStatus = gameStatus;
    this.checkedPlayer = checkedPlayer;
    this.castleRights = castleRights;
    this.lastMovementWasAPJump = lastMovementWasAPJump;
  }
  private static pieceFromByte(b: number): Piece | null {
    if (b === 0) {
      return null;
    }
    const player: Player = (b & 8) === 8 ? Player.BLACK_PLAYER : Player.WHITE_PLAYER;
    const hasBeenMoved = (b & 16) === 16;
    b = b & 7;
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
  private static promotionByteToTag(b: number): string {
    switch (b) {
      case 1:
        return "Q";
      case 2:
        return "N";
      case 3:
        return "B";
      case 4:
        return "R";
      case 5:
        return "e.p";
      default:
        return "";
    }
  }
  private static bytesToMove(movementBytes: number[]): string | null {
    const startCoord = GameState.positionToCoordinates(movementBytes[0]);
    const endCoord = GameState.positionToCoordinates(movementBytes[1]);
    if (startCoord == null || endCoord == null) {
      return null;
    }
    let promotion = "";
    if (movementBytes[2]) {
      promotion = GameState.promotionByteToTag(movementBytes[2]);
    }
    return startCoord + endCoord + promotion;
  }
  private static byteToPlayer(b: number) {
    switch (b) {
      case 0:
        return Player.WHITE_PLAYER;
      case 1:
        return Player.BLACK_PLAYER;
      default:
        return Player.UNKNOWN_PLAYER;
    }
  }
  private static castleRightsFromByte(b: number): CastleRights {
    return {
      blackKingSide: ((b & 8) === 8),
      blackQueenSide: ((b & 4) === 4),
      whiteKingSide: ((b & 2) === 2),
      whiteQueenSide: ((b & 1) === 1)
    }
  }
  private static hasTag(b: number): boolean {
    return (b & 128) === 128;
  }
  public static fromSerialized(data: Uint8Array): GameState {
    const pieces: (Piece | null)[] = [];
    const outPieces: Piece[] = [];
    let playerTurn = Player.WHITE_PLAYER;
    let readingMoves = false;
    let checkedPlayer = Player.UNKNOWN_PLAYER;
    let gameStatus = GameStatus.PLAYING;
    let lastMovementWasAPJump = false;
    let castleRights: CastleRights = {
      blackKingSide: false,
      blackQueenSide: false,
      whiteQueenSide: false,
      whiteKingSide: false
    };
    const movementHistory: string[] = [];
    const bytesMovement: number[] = [0, 0, 0];
    let idx = 0;
    data.forEach((b, i) => {
      //first byte is defining the player turn
      if (i === 0) {
        if ((b & 4) === 4) {
          lastMovementWasAPJump = true;
          b |= 3;
        }
        playerTurn = b === 1 ? Player.BLACK_PLAYER : Player.WHITE_PLAYER;
        return;
      }
      if (i === 1) {
        checkedPlayer = this.byteToPlayer(b);
        return;
      }
      if (i === 2) {
        if (b === 1) {
          gameStatus = GameStatus.CHECKMATE;
        } else if (b === 2) {
          gameStatus = GameStatus.STALEMATE;
        }
        return;
      }
      if (i === 3) {
        castleRights = this.castleRightsFromByte(b)
        return;
      }
      //next 64 bytes are used to define the game table status
      if (i < 68) {
        pieces[i - 4] = b === 0 ? null : GameState.pieceFromByte(b);
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
        const piece = GameState.pieceFromByte(b);
        if (piece !== null) {
          outPieces.push(piece);
        }
        return;
      }
      if (idx === 1) {
        if (this.hasTag(b)) {
          b &= 127;
          bytesMovement[idx] = b;
          idx++
          return;
        }
      }
      bytesMovement[idx] = b;
      idx++;
      if (idx >= 2) {
        const movement = GameState.bytesToMove(bytesMovement);
        idx = 0;
        bytesMovement[2] = 0;
        if (movement !== null) {
          movementHistory.push(movement);
        }
      }
    });
    return new GameState(pieces, outPieces, movementHistory, playerTurn, gameStatus, checkedPlayer, castleRights, lastMovementWasAPJump);
  }
}

export default class Game {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  relation: relation;
  gameState: GameState;

  constructor(id: string, whitePlayer: string, blackPlayer: string, relation: relation, gameState: GameState) {
    this.id = id;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.relation = relation;
    this.gameState = gameState;
  }
}
