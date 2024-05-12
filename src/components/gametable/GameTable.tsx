import Game, { GameStatus, Piece, PieceType, Player } from "@/lib/models/game";
import { PlayerGameRelation, ServerMove, charToPieceType, pieceTypeToChar } from "@/types";
import clsx from "clsx";
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import Draggable, { DraggableData } from "react-draggable";
import Popover from "../Popover";
import SelectPromotion from "./SelectPromotion";
import { getHoveredSquare, isCastlingMovement, requiresPromotion } from "./GameTableUtils";

export interface GameTableProps {
  initialGame: Game,
  gameRelation: PlayerGameRelation,
  onMove?: (move: string) => void,
  onGameUpdate?: (updatedGame: Game) => void,
}
export type GameTableHandlers = {
  processMove: (move: ServerMove) => void
}


function GameTableComponent({ initialGame, gameRelation, onMove, onGameUpdate }: GameTableProps, ref: Ref<GameTableHandlers>) {

  const [game, setGame] = useState<Game>(initialGame);
  const [popoverInfo, setPopoverInfo] = useState<{ open: boolean, pos: { x: number, y: number } }>({
    open: false,
    pos: { x: 0, y: 0 },
  });
  const [lastMove, setLastMove] = useState<string | null>(null);
  function processMove(move: ServerMove) {
    const tableStatus = game.gameState.table;
    const initIndex = getIndexFromCoords(move.uci.substring(0, 2));
    const endIndex = getIndexFromCoords(move.uci.substring(2, 4));
    const castling = isCastlingMovement(game, initIndex, endIndex);
    const newTableStatus = [...tableStatus];
    let capturedPieces = game.gameState.outTable;
    let hasCapturedPiece = false;
    let uciMovement = move.uci;
    if (castling.isCastling) {
      newTableStatus[endIndex] = newTableStatus[initIndex];
      newTableStatus[initIndex] = null;
      newTableStatus[castling.rookEnd] = newTableStatus[castling.rookStart]
      newTableStatus[castling.rookStart] = null;
    } else {
      capturedPieces = [...game.gameState.outTable];
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
      if (move.enPassantCapture?.length > 0) {
        uciMovement += "e.p";
        const enPassantField = getIndexFromCoords(move.enPassantCapture);
        capturedPieces.push(newTableStatus[enPassantField] as Piece);
        hasCapturedPiece = true;
        newTableStatus[enPassantField] = null;
      }
    }
    const gameStatus = move.mateStatus as GameStatus;
    const newGame = {
      ...game,
      gameState: {
        ...game.gameState,
        table: newTableStatus,
        moves: [...game.gameState.moves, uciMovement],
        checkedPlayer: move.checkedPlayer,
        gameStatus: gameStatus,
        playerTurn: ((game.gameState.moves.length + 1) % 2) as Player,
        outTable: hasCapturedPiece ? capturedPieces : game.gameState.outTable,
      }
    };
    setGame(newGame);
    if (onGameUpdate) {
      onGameUpdate(newGame);
    }
  }

  useImperativeHandle(ref, () => ({
    processMove: processMove,
  }));

  const isDraggable = (pieceOwner: Player): boolean => {
    return gameRelation !== "observer" &&
      (pieceOwner === Player.BLACK_PLAYER && gameRelation === "black" && game.gameState.playerTurn === Player.BLACK_PLAYER) ||
      (pieceOwner === Player.WHITE_PLAYER && gameRelation === "white" && game.gameState.playerTurn === Player.WHITE_PLAYER);
  }
  function getNumeration(): React.JSX.Element[] {
    let i = 8;
    const numbers = [];
    while (i > 0) {
      numbers.push(<div key={`table-number-${9 - i}`} className="h-14 py-2.5 font-bold justify-center" > {9 - i}</div >);
      i--;
    }
    return numbers;
  }
  function getLetters(): React.JSX.Element[] {
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

  function onMoveStop(e: DraggableData) {
    if (!tableRef.current) return;
    const cells = tableRef.current?.childNodes ?? [];
    const hoveredSquare = getHoveredSquare(cells, e);
    if (hoveredSquare) {
      const startPos = (e.node.parentNode?.parentNode as HTMLElement).getAttribute("data-coord") ?? "";
      const endPos = hoveredSquare.getAttribute("data-coord") ?? "";
      if (startPos === endPos)
        return;
      setLastMove(startPos + endPos);
      const initIndex = getIndexFromCoords(startPos);
      const endIndex = getIndexFromCoords(endPos);
      const initPiece = game.gameState.table[initIndex];
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
    const cells = tableRef.current?.childNodes ?? [];
    const hoveredSquare = getHoveredSquare(cells, e);
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
    return (game.gameState.checkedPlayer === p?.player);
  }
  return (
    <>
      <div className="flex w-full flex-row select-none">
        <div className="m-2 w-2 flex flex-col text-white">
          {getNumeration()}
        </div>
        <div className="m-2 grid grid-cols-8" key={tableKey} ref={tableRef}>
          {game.gameState.table.map((p, i) => {

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
                      <div className="w-full h-full cursor-pointer">
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
