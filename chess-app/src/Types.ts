export enum TeamType {
  OPPONENT = "b",
  OUR = "w",
}

export enum PieceType {
  PAWN = "pawn",
  BISHOP = "bishop",
  KNIGHT = "knight",
  ROOK = "rook",
  QUEEN = "queen",
  KING = "king",
}

export interface Position {
  x: number;
  y: number;
}

export interface Piece extends Position {
  image: string;
  type: PieceType;
  team: TeamType;
  hasMoved?: boolean;
  enPassant?: boolean;
}

export const samePosition = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

export const inBounds = (position: Position): boolean =>
  position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7;

const pieceImage = (type: PieceType, team: TeamType): string =>
  `assets/images/${type}_${team}.png`;

const backRow: PieceType[] = [
  PieceType.ROOK,
  PieceType.KNIGHT,
  PieceType.BISHOP,
  PieceType.QUEEN,
  PieceType.KING,
  PieceType.BISHOP,
  PieceType.KNIGHT,
  PieceType.ROOK,
];

function createInitialBoard(): Piece[] {
  const pieces: Piece[] = [];

  for (const team of [TeamType.OUR, TeamType.OPPONENT]) {
    const homeRow = team === TeamType.OUR ? 0 : 7;
    const pawnRow = team === TeamType.OUR ? 1 : 6;

    backRow.forEach((type, x) => {
      pieces.push({ x, y: homeRow, type, team, image: pieceImage(type, team) });
    });

    for (let x = 0; x < 8; x++) {
      pieces.push({ x, y: pawnRow, type: PieceType.PAWN, team, image: pieceImage(PieceType.PAWN, team) });
    }
  }

  return pieces;
}

export const initialBoard: Piece[] = createInitialBoard();
