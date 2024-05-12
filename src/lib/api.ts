import Game, { GameState } from "./models/game";
import { default as ApiGame } from "./api/models/game.ts";
import urlJoin from 'url-join';
import { ChosenColor } from "@/types/index.ts";

export default class Api {
  private baseUrl: string;
  // private sessionId: string;
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // this.sessionId = this.newSessionId();
  }

  /*  private newSessionId() {
      return [...Array(30)].map(() => Math.random().toString(36)[2]).join('');
    }
  */
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
    const result = await fetch(urlJoin(this.baseUrl, 'game', gameId), {
      credentials: 'include'
    });
    if (!result.ok) {
      await this.processError(result);
    }
    const resultGame = (await result.json()) as ApiGame;
    const boardData = this.base64ToArrayBuffer(resultGame.board);
    return new Game(resultGame.gameId, resultGame.whitePlayer, resultGame.blackPlayer, resultGame.relation, GameState.fromSerialized(boardData));
  }

  public async createGame(color: ChosenColor): Promise<string> {
    let isBlack = 'false';
    if (color === 'black') {
      isBlack = 'true';
    } else if (color === 'random') {
      isBlack = Math.random() < 0.5 ? 'true' : 'false';
    }
    const result = await fetch(
      urlJoin(this.baseUrl, `game?is_black=${isBlack}`),
      { method: 'POST', credentials: 'include' }
    );
    if (!result.ok) {
      await this.processError(result);
    }
    const resultInfo = await result.json() as { message: string, game_id: string };
    return resultInfo.game_id;
  }
}
