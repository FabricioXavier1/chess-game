import { Piece, Position } from "../../Types";
import { getPossibleBishopMoves } from "./BishopRules";
import { getPossibleRookMoves } from "./RookRules";

export function getPossibleQueenMoves(queen: Piece, boardState: Piece[]): Position[] {
  return [...getPossibleBishopMoves(queen, boardState), ...getPossibleRookMoves(queen, boardState)];
}
