import { Piece, PieceType, Position, TeamType, samePosition } from "../Types";
import { tileIsOccupied } from "./rules/GeneralRules";
import { getPossiblePawnMoves, getPawnAttackSquares } from "./rules/PawnRules";
import { getPossibleKnightMoves } from "./rules/KnightRules";
import { getPossibleBishopMoves } from "./rules/BishopRules";
import { getPossibleRookMoves } from "./rules/RookRules";
import { getPossibleQueenMoves } from "./rules/QueenRules";
import { getPossibleKingMoves } from "./rules/KingRules";

export default class Referee {
  getPossibleMoves(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, boardState);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, boardState);
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, boardState);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, boardState);
      case PieceType.KING:
        return [...getPossibleKingMoves(piece, boardState), ...this.getCastlingMoves(piece, boardState)];
      default:
        return [];
    }
  }

  // squares a piece attacks/defends, ignoring castling (used for check detection to avoid recursion)
  private getAttackerMoves(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPawnAttackSquares(piece);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, boardState);
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, boardState);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, boardState);
      case PieceType.KING:
        return getPossibleKingMoves(piece, boardState);
      default:
        return [];
    }
  }

  isTileAttacked(position: Position, byTeam: TeamType, boardState: Piece[]): boolean {
    return boardState
      .filter((p) => p.team === byTeam)
      .some((p) => this.getAttackerMoves(p, boardState).some((m) => samePosition(m, position)));
  }

  isKingInCheck(team: TeamType, boardState: Piece[]): boolean {
    const king = boardState.find((p) => p.type === PieceType.KING && p.team === team);
    if (!king) return false;
    const opponent = team === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
    return this.isTileAttacked(king, opponent, boardState);
  }

  private getCastlingMoves(king: Piece, boardState: Piece[]): Position[] {
    if (king.hasMoved) return [];

    const opponent = king.team === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
    if (this.isTileAttacked(king, opponent, boardState)) return [];

    const rooks = boardState.filter(
      (p) => p.type === PieceType.ROOK && p.team === king.team && !p.hasMoved && p.y === king.y
    );

    const moves: Position[] = [];

    for (const rook of rooks) {
      const direction = rook.x > king.x ? 1 : -1;
      const start = Math.min(king.x, rook.x) + 1;
      const end = Math.max(king.x, rook.x);

      let pathClear = true;
      for (let x = start; x < end; x++) {
        if (tileIsOccupied({ x, y: king.y }, boardState)) {
          pathClear = false;
          break;
        }
      }
      if (!pathClear) continue;

      const passThrough: Position = { x: king.x + direction, y: king.y };
      const landing: Position = { x: king.x + direction * 2, y: king.y };
      if (this.isTileAttacked(passThrough, opponent, boardState)) continue;
      if (this.isTileAttacked(landing, opponent, boardState)) continue;

      moves.push(landing);
    }

    return moves;
  }

  private simulateMove(piece: Piece, destination: Position, boardState: Piece[]): Piece[] {
    const isEnPassantCapture =
      piece.type === PieceType.PAWN &&
      piece.x !== destination.x &&
      !boardState.some((p) => samePosition(p, destination));

    return boardState
      .filter((p) => {
        if (samePosition(p, destination) && p.team !== piece.team) return false;
        if (
          isEnPassantCapture &&
          p.type === PieceType.PAWN &&
          p.team !== piece.team &&
          p.x === destination.x &&
          p.y === piece.y
        ) {
          return false;
        }
        return true;
      })
      .map((p) => (samePosition(p, piece) ? { ...p, x: destination.x, y: destination.y } : p));
  }

  getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
    return this.getPossibleMoves(piece, boardState).filter((move) => {
      const simulated = this.simulateMove(piece, move, boardState);
      return !this.isKingInCheck(piece.team, simulated);
    });
  }

  isValidMove(piece: Piece, destination: Position, boardState: Piece[]): boolean {
    return this.getValidMoves(piece, boardState).some((m) => samePosition(m, destination));
  }

  hasNoLegalMoves(team: TeamType, boardState: Piece[]): boolean {
    return boardState.filter((p) => p.team === team).every((p) => this.getValidMoves(p, boardState).length === 0);
  }

  isCheckmate(team: TeamType, boardState: Piece[]): boolean {
    return this.isKingInCheck(team, boardState) && this.hasNoLegalMoves(team, boardState);
  }

  isStalemate(team: TeamType, boardState: Piece[]): boolean {
    return !this.isKingInCheck(team, boardState) && this.hasNoLegalMoves(team, boardState);
  }
}
