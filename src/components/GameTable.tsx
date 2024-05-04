import Game, { Piece, PieceType, Player } from "@/lib/models/game";
import { PlayerGameRelation, ServerMove, charToPieceType, pieceTypeToChar } from "@/types";
import clsx from "clsx";
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import Draggable, { DraggableData } from "react-draggable";
import Popover from "./Popover";
import SelectPromotion from "./SelectPromotion";

export interface GameTableProps {
  initialGameState: Game,
  gameRelation: PlayerGameRelation,
  onMove?: (move: string) => void,
  onGameUpdate?: (updatedGame: Game) => void,
}
export type GameTableHandlers = {
  processMove: (move: ServerMove) => void
}


function GameTableComponent({ initialGameState, gameRelation, onMove, onGameUpdate }: GameTableProps, ref: Ref<GameTableHandlers>) {

  const [gameState, setGameState] = useState<Game>(initialGameState);
  const [popoverInfo, setPopoverInfo] = useState<{ open: boolean, pos: { x: number, y: number } }>({
    open: false,
    pos: { x: 0, y: 0 },
  });
  const [lastMove, setLastMove] = useState<string | null>(null);
  function isCastlingMovement(initIndex: number, endIndex: number): { isCastling: boolean, rookStart: number, rookEnd: number } {
    const defaultResponse = {
      rookStart: 0,
      rookEnd: 0,
      isCastling: false
    };
    if (gameState.gameStatus.table[initIndex] === null || gameState.gameStatus.table[initIndex]?.pieceType !== PieceType.KING)
      return defaultResponse;
    if (initIndex === 4 && endIndex === 2) {
      return {
        isCastling: true,
        rookStart: 0,
        rookEnd: 3
      }
    }
    if (initIndex === 4 && endIndex === 6) {
      return {
        isCastling: true,
        rookStart: 7,
        rookEnd: 5
      }
    }
    if (initIndex === 60 && endIndex === 62) {
      return {
        isCastling: true,
        rookStart: 63,
        rookEnd: 61
      }
    }
    if (initIndex === 60 && endIndex === 58) {
      return {
        isCastling: true,
        rookStart: 56,
        rookEnd: 59
      }
    }
    return defaultResponse;
  }
  function processMove(move: ServerMove) {
    const tableStatus = gameState.gameStatus.table;
    const initIndex = getIndexFromCoords(move.uci.substring(0, 2));
    const endIndex = getIndexFromCoords(move.uci.substring(2, 4));
    const castling = isCastlingMovement(initIndex, endIndex);
    const newTableStatus = [...tableStatus];
    let capturedPieces = gameState.gameStatus.outTable;
    let hasCapturedPiece = false;
    if (castling.isCastling) {
      newTableStatus[endIndex] = newTableStatus[initIndex];
      newTableStatus[initIndex] = null;
      newTableStatus[castling.rookEnd] = newTableStatus[castling.rookStart]
      newTableStatus[castling.rookStart] = null;
    } else {
      capturedPieces = [...gameState.gameStatus.outTable];
      const promotion = move.uci.length === 5 && ["Q", "R", "B", "N"].includes(move.uci[4].toUpperCase()) ?
        move.uci[4].toUpperCase() : null;
      if (newTableStatus[endIndex] !== null) {
        capturedPieces.push(newTableStatus[endIndex] as Piece);
        hasCapturedPiece = true;
      }
      newTableStatus[endIndex] = newTableStatus[initIndex];
      if (promotion && newTableStatus[endIndex]) {
        newTableStatus[endIndex]!.pieceType = charToPieceType(promotion);
      }
      newTableStatus[initIndex] = null;
    }
    const newGameState = {
      ...gameState,
      gameStatus: {
        ...gameState.gameStatus,
        table: newTableStatus,
        moves: [...gameState.gameStatus.moves, move.uci],
        checkedPlayer: move.checkedPlayer,
        checkMate: move.isMate,
        playerTurn: ((gameState.gameStatus.moves.length + 1) % 2) as Player,
        outTable: hasCapturedPiece ? capturedPieces : gameState.gameStatus.outTable,
      }
    };
    setGameState(newGameState);
    if (onGameUpdate) {
      onGameUpdate(newGameState);
    }
  }

  useImperativeHandle(ref, () => ({
    processMove: processMove,
  }));
  const isDraggable = (pieceOwner: Player): boolean => {
    return gameRelation !== "observer" &&
      (pieceOwner === Player.BLACK_PLAYER && gameRelation === "black" && gameState.gameStatus.playerTurn === Player.BLACK_PLAYER) ||
      (pieceOwner === Player.WHITE_PLAYER && gameRelation === "white" && gameState.gameStatus.playerTurn === Player.WHITE_PLAYER);
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
  function getHoveredSquare(e: DraggableData): HTMLElement | undefined {
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
  function requiresPromotion(piece: Piece | null, endPosition: number): boolean {
    return piece?.pieceType === PieceType.PAWN &&
      ((piece?.player === Player.BLACK_PLAYER && endPosition >= 56) ||
        (piece?.player === Player.WHITE_PLAYER && endPosition < 8));

  }
  function onMoveStop(e: DraggableData) {
    if (!tableRef.current) return;
    const hoveredSquare = getHoveredSquare(e);
    if (hoveredSquare) {
      const startPos = (e.node.parentNode?.parentNode as HTMLElement).getAttribute("data-coord") ?? "";
      const endPos = hoveredSquare.getAttribute("data-coord") ?? "";
      if (startPos === endPos)
        return;
      setLastMove(startPos + endPos);
      const initIndex = getIndexFromCoords(startPos);
      const endIndex = getIndexFromCoords(endPos);
      const initPiece = gameState.gameStatus.table[initIndex];
      if (requiresPromotion(initPiece, endIndex)) {
        setPopoverInfo({
          open: true,
          pos: {
            x: hoveredSquare.getBoundingClientRect().left,
            y: hoveredSquare.getBoundingClientRect().top
          }
        });
        return;
      }
      if (onMove) {
        onMove(startPos + endPos);
      }
    }
    setTableKey(Math.random() + "");
    setFocusedPosition(null);
  }
  function onDrag(e: DraggableData) {
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
      <div className="flex w-full flex-row select-none">
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
                  {
                    isDraggable(p.player) ?
                      <Draggable onStop={(_e, d) => { onMoveStop(d); }} onDrag={(_e, d) => onDrag(d)}>
                        <div className="w-full h-full cursor-pointer">
                          <div className="m-auto">{pieceTypeToChar(p.pieceType)}</div>
                        </div>
                      </Draggable> :
                      <div className="w-full h-full cursor-default">
                        <div className="m-auto">{pieceTypeToChar(p.pieceType)}</div>
                      </div>
                  }
                </div>
              }
            </div>
          })}
        </div>
      </div>
      <div className="flex w-full flex-row text-white pl-8 select-none">
        {getLetters()}
      </div>
      <Popover open={popoverInfo.open} pos={popoverInfo.pos}><SelectPromotion onSelectPromo={(promoInfo) => {
        setPopoverInfo({ ...popoverInfo, open: false });
        if (onMove) {
          onMove(lastMove + promoInfo.char);
        }
      }} /></Popover>
    </>
  );
}
const GameTable = forwardRef<GameTableHandlers, GameTableProps>(GameTableComponent);
export default GameTable;
