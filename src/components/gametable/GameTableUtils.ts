import Game, { Piece, PieceType, Player } from "@/lib/models/game";
import { DraggableData } from "react-draggable";

export function isCastlingMovement(gameState: Game, initIndex: number, endIndex: number): { isCastling: boolean, rookStart: number, rookEnd: number } {
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

export function calcSuperPosRectangle(first: DOMRect, second: DOMRect): number {

  const startX = Math.max(first.x, second.x);
  const endX = Math.min(first.x + first.width, second.x + second.width);

  const startY = Math.max(first.y, second.y);
  const endY = Math.min(first.y + first.height, second.y + second.height);

  const area = Math.max(0, (endX - startX)) * Math.max(0, (endY - startY));
  return area;
}

export function getHoveredSquare(cells: NodeListOf<ChildNode>, e: DraggableData): HTMLElement | undefined {
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

export function requiresPromotion(piece: Piece | null, endPosition: number): boolean {
  return piece?.pieceType === PieceType.PAWN &&
    ((piece?.player === Player.BLACK_PLAYER && endPosition >= 56) ||
      (piece?.player === Player.WHITE_PLAYER && endPosition < 8));

}

