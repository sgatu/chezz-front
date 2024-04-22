import Game, { GameStatus } from "./models/game";
import { default as ApiGame } from "./api/models/game.ts";
import urlJoin from 'url-join';

export default class Api {
  private baseUrl: string;
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }


  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async processError(result: Response) {
    const resultError = (await result.json()) as { message: string, code: number };
    throw new Error(resultError.message)
  }

  public async getGame(gameId: string): Promise<Game> {
    const result = await fetch(urlJoin(this.baseUrl, 'game', gameId));
    if (!result.ok) {
      await this.processError(result);
    }
    const resultGame = (await result.json()) as ApiGame;
    const boardData = this.base64ToArrayBuffer(resultGame.board);
    return new Game(resultGame.gameId, resultGame.whitePlayer, resultGame.blackPlayer, resultGame.relation, GameStatus.fromSerialized(boardData));
  }
}
