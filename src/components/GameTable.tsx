import Game, { PieceType, Player } from "@/lib/models/game";
import clsx from "clsx";

interface GameTableProps {
  initialGameState: Game
}
export default function GameTable({ initialGameState }: GameTableProps) {
  const pieceTypeToC = (pType: PieceType): string => {
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
  return (
    <>
      <div className="flex w-full">
        <div className="m-2 grid grid-cols-8">
          {initialGameState.gameStatus.table.map((p, i) => {
            return <div
              className={
                clsx(
                  "font-bold",
                  "py-2.5",
                  "border",
                  "divide-solid",
                  "h-14",
                  "w-14",
                  ((i % 2) === ((Math.floor(i / 8.0) % 2 === 0) ? 1 : 0) ? "bg-[#739756]" : "bg-[#ECEFD1]"),
                  p?.player === Player.BLACK_PLAYER ? "text-black" : "text-gray-400"
                )}
            >
              {p === null ? " " : pieceTypeToC(p.pieceType)}
            </div>
          })}
        </div>
      </div>
    </>
  );
}
