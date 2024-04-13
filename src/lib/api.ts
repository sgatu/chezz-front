import Game, { GameStatus } from "./models/game";


export default class Api {

  public async getGame(gameId: string): Promise<Game> {
    await fetch(input)
    return new Game("", "", "", "white", GameStatus.fromSerialized(Uint8Array.of(1)));
  }
}
