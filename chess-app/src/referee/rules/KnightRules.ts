import { Piece, Position, inBounds } from "../../Types";
import { tileIsEmptyOrOccupiedByOpponent } from "./GeneralRules";

const offsets: Position[] = [
  { x: 1, y: 2 },
  { x: -1, y: 2 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: 2, y: 1 },
  { x: -2, y: 1 },
  { x: 2, y: -1 },
  { x: -2, y: -1 },
];

export function getPossibleKnightMoves(knight: Piece, boardState: Piece[]): Position[] {
  return offsets
    .map((o) => ({ x: knight.x + o.x, y: knight.y + o.y }))
    .filter((pos) => inBounds(pos) && tileIsEmptyOrOccupiedByOpponent(pos, boardState, knight.team));
}
