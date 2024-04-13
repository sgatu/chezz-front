export default interface GameModel {
  relation: 'white' | 'black' | 'observer',
  blackPlayer: string,
  whitePlayer: string,
  gameId: string,
  board: string,
}
