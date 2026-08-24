import { Piece, Position, inBounds } from "../../Types";
import { tileIsEmptyOrOccupiedByOpponent } from "./GeneralRules";

export function getPossibleKingMoves(king: Piece, boardState: Piece[]): Position[] {
  const moves: Position[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const pos: Position = { x: king.x + dx, y: king.y + dy };
      if (inBounds(pos) && tileIsEmptyOrOccupiedByOpponent(pos, boardState, king.team)) {
        moves.push(pos);
      }
    }
  }

  return moves;
}
