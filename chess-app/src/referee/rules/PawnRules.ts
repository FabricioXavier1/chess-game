import { Piece, PieceType, Position, TeamType, inBounds } from "../../Types";
import { tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export function getPossiblePawnMoves(pawn: Piece, boardState: Piece[]): Position[] {
  const possibleMoves: Position[] = [];
  const specialRow = pawn.team === TeamType.OUR ? 1 : 6;
  const direction = pawn.team === TeamType.OUR ? 1 : -1;

  const normalMove: Position = { x: pawn.x, y: pawn.y + direction };
  const doubleMove: Position = { x: pawn.x, y: pawn.y + direction * 2 };

  if (inBounds(normalMove) && !tileIsOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);
    if (pawn.y === specialRow && !tileIsOccupied(doubleMove, boardState)) {
      possibleMoves.push(doubleMove);
    }
  }

  const captureLeft: Position = { x: pawn.x - 1, y: pawn.y + direction };
  const captureRight: Position = { x: pawn.x + 1, y: pawn.y + direction };

  [captureLeft, captureRight].forEach((target) => {
    if (!inBounds(target)) return;

    if (tileIsOccupiedByOpponent(target, boardState, pawn.team)) {
      possibleMoves.push(target);
      return;
    }

    const enPassantVictim = boardState.find(
      (p) =>
        p.x === target.x &&
        p.y === pawn.y &&
        p.type === PieceType.PAWN &&
        p.team !== pawn.team &&
        p.enPassant
    );
    if (!tileIsOccupied(target, boardState) && enPassantVictim) {
      possibleMoves.push(target);
    }
  });

  return possibleMoves;
}

export function getPawnAttackSquares(pawn: Piece): Position[] {
  const direction = pawn.team === TeamType.OUR ? 1 : -1;
  return [
    { x: pawn.x - 1, y: pawn.y + direction },
    { x: pawn.x + 1, y: pawn.y + direction },
  ].filter(inBounds);
}
