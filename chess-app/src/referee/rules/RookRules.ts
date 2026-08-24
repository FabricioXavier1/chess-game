import { Piece, Position, inBounds } from "../../Types";
import { tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

const directions: Position[] = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

export function getPossibleRookMoves(rook: Piece, boardState: Piece[]): Position[] {
  const moves: Position[] = [];

  for (const dir of directions) {
    for (let i = 1; i < 8; i++) {
      const pos: Position = { x: rook.x + dir.x * i, y: rook.y + dir.y * i };
      if (!inBounds(pos)) break;

      if (!tileIsOccupied(pos, boardState)) {
        moves.push(pos);
        continue;
      }

      if (tileIsOccupiedByOpponent(pos, boardState, rook.team)) {
        moves.push(pos);
      }
      break;
    }
  }

  return moves;
}
