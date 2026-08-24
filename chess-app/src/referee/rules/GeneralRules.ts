import { Piece, Position, TeamType } from "../../Types";

export const tileIsOccupied = (position: Position, boardState: Piece[]): boolean =>
  boardState.some((p) => p.x === position.x && p.y === position.y);

export const tileIsOccupiedByOpponent = (
  position: Position,
  boardState: Piece[],
  team: TeamType
): boolean =>
  boardState.some((p) => p.x === position.x && p.y === position.y && p.team !== team);

export const tileIsEmptyOrOccupiedByOpponent = (
  position: Position,
  boardState: Piece[],
  team: TeamType
): boolean =>
  !tileIsOccupied(position, boardState) || tileIsOccupiedByOpponent(position, boardState, team);
