import Game, { Piece, PieceType, Player } from "@/lib/models/game";
import clsx from "clsx";
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import Draggable, { DraggableData } from "react-draggable";

export interface GameTableProps {
  initialGameState: Game,
  onMove?: (move: string) => void,
}
export type GameTableHandlers = {
  processMove: (move: string) => void
}
function GameTableComponent({ initialGameState, onMove }: GameTableProps, ref: Ref<GameTableHandlers>) {

  const [gameState, setGameState] = useState<Game>(initialGameState);

  const processMove = (move: string) => {
    const tableStatus = gameState.gameStatus.table;
    const initIndex = getIndexFromCoords(move.substring(0, 2));
    const endIndex = getIndexFromCoords(move.substring(2, 4));
    const newTableStatus = [...tableStatus];
    newTableStatus[endIndex] = newTableStatus[initIndex];
    newTableStatus[initIndex] = null;
    setGameState(
      {
        ...gameState,
        gameStatus: {
          ...gameState.gameStatus,
          table: newTableStatus,
          moves: [move, ...gameState.gameStatus.moves]
        }
      }
    );
  }

  useImperativeHandle(ref, () => ({
    processMove: processMove
  }));

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

  const getNumeration = (): React.JSX.Element[] => {

    let i = 8;
    const numbers = [];
    while (i > 0) {
      numbers.push(<div key={`table-number-${9 - i}`} className="h-14 py-2.5 font-bold justify-center" > {9 - i}</div >);
      i--;
    }
    return numbers;
  }
  const getLetters = (): React.JSX.Element[] => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let i = 0;
    const lettersEls = [];
    while (i < letters.length) {
      lettersEls.push(<div key={`table-letter-${i}`} className="w-14 font-bold justify-center" > {letters[i]}</div >);
      i++;
    }
    return lettersEls;
  }
  const [tableKey, setTableKey] = useState<string>('tableKey');
  const tableRef = useRef<HTMLDivElement>(null);
  const [focusedPosition, setFocusedPosition] = useState<string | null>(null);

  const calcSuperPosRectangle = (first: DOMRect, second: DOMRect): number => {

    const startX = Math.max(first.x, second.x);
    const endX = Math.min(first.x + first.width, second.x + second.width);

    const startY = Math.max(first.y, second.y);
    const endY = Math.min(first.y + first.height, second.y + second.height);

    const area = Math.max(0, (endX - startX)) * Math.max(0, (endY - startY));
    return area;
  }
  const getHoveredSquare = (e: DraggableData): HTMLElement | undefined => {
    const cells = tableRef.current?.childNodes ?? [];
    const dragBounds = e.node.getBoundingClientRect();
    let hoveredSquare: (HTMLElement | undefined);
    let biggestCollisionArea = 0;
    cells.forEach(element => {
      const squareBounds = (element as HTMLElement).getBoundingClientRect();
      const collisionArea = calcSuperPosRectangle(dragBounds, squareBounds);
      if (collisionArea > 10 && collisionArea > biggestCollisionArea) {
        biggestCollisionArea = collisionArea;
        hoveredSquare = (element as HTMLElement);
      }
    });
    return hoveredSquare;
  }
  const onMoveStop = (e: DraggableData) => {
    if (!tableRef.current) return;
    const hoveredSquare = getHoveredSquare(e);
    if (hoveredSquare) {
      const startPos = (e.node.parentNode?.parentNode as HTMLElement).getAttribute("data-coord") ?? "";
      const endPos = hoveredSquare.getAttribute("data-coord") ?? "";
      if (onMove && startPos !== endPos) {
        onMove(startPos + endPos);
      }
    }
    setTableKey(Math.random() + "");
    setFocusedPosition(null);
  }
  const onDrag = (e: DraggableData) => {
    if (!tableRef.current) return;
    const hoveredSquare = getHoveredSquare(e);
    if (hoveredSquare) {
      const startPos = (e.node.parentNode?.parentNode as HTMLElement).getAttribute("data-coord") ?? "";
      const endPos = hoveredSquare.getAttribute("data-coord") ?? "";
      if (startPos !== endPos) {
        setFocusedPosition(endPos);
      } else {
        setFocusedPosition(null);
      }
    }
  }

  const getCoordsFromIndex = (index: number): string => {
    const posNum: number = Math.floor(index / 8.0) + 1;
    const posLetter: string = ["a", "b", "c", "d", "e", "f", "g", "h"].at(index % 8) ?? "";
    return posLetter + posNum;
  }
  const getIndexFromCoords = (coords: string): number => {
    const letter = coords[0];
    const number = coords[1];
    const index = (parseInt(number) - 1) * 8 + ["a", "b", "c", "d", "e", "f", "g", "h"].indexOf(letter);
    return index;
  }
  const isPieceChecked = (p: Piece | null): boolean => {
    if (p?.pieceType !== PieceType.KING) return false;
    return (gameState.gameStatus.checkedPlayer === p?.player);
  }
  return (
    <>
      <div className="flex w-full flex-row">
        <div className="m-2 w-2 flex flex-col text-white">
          {getNumeration()}
        </div>
        <div className="m-2 grid grid-cols-8" key={tableKey} ref={tableRef}>
          {gameState.gameStatus.table.map((p, i) => {

            const coords = getCoordsFromIndex(i);
            const border = (isPieceChecked(p) ? "border-rose-500 border-2" : (focusedPosition === coords ? "border-sky-500 border-2" : "border"));
            return <div className="h-14 w-14" key={`table-square-${i}`} data-coord={coords}>
              {p === null ? <div className={clsx("h-full", "w-full", border, "divide-solid",
                ((i % 2) === ((Math.floor(i / 8.0) % 2 === 0) ? 1 : 0) ? "bg-[#739756]" : "bg-[#ECEFD1]"),
              )}>&nbsp;</div> :
                <div
                  key={`table-pos-${i}`}
                  className={
                    clsx(
                      "font-bold",
                      border,
                      "divide-solid",
                      "h-full",
                      "w-full",
                      ((i % 2) === ((Math.floor(i / 8.0) % 2 === 0) ? 1 : 0) ? "bg-[#739756]" : "bg-[#ECEFD1]"),
                      p?.player === Player.BLACK_PLAYER ? "text-black" : "text-white text-shadow-around"
                    )}
                >
                  <Draggable onStop={(_e, d) => { onMoveStop(d); }} onDrag={(_e, d) => onDrag(d)}>
                    <div className="w-full h-full cursor-pointer">
                      <div className="m-auto">{pieceTypeToC(p.pieceType)}</div>
                    </div>
                  </Draggable>
                </div>
              }
            </div>
          })}
        </div>
      </div>
      <div className="flex w-full flex-row pl-inherit text-white">
        {getLetters()}
      </div>
      <div>TURN <div className={clsx("inline-block w-8 h-8", gameState.gameStatus.moves.length % 2 === 0 ? "bg-white" : "bg-black")}></div></div>
    </>
  );
}
const GameTable = forwardRef<GameTableHandlers, GameTableProps>(GameTableComponent);
export default GameTable;
