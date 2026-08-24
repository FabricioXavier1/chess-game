import { Piece, Position, inBounds } from "../../Types";
import { tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

const directions: Position[] = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];

export function getPossibleBishopMoves(bishop: Piece, boardState: Piece[]): Position[] {
  const moves: Position[] = [];

  for (const dir of directions) {
    for (let i = 1; i < 8; i++) {
      const pos: Position = { x: bishop.x + dir.x * i, y: bishop.y + dir.y * i };
      if (!inBounds(pos)) break;

      if (!tileIsOccupied(pos, boardState)) {
        moves.push(pos);
        continue;
      }

      if (tileIsOccupiedByOpponent(pos, boardState, bishop.team)) {
        moves.push(pos);
      }
      break;
    }
  }

  return moves;
}
