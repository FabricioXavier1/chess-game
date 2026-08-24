import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import PawnPromotionModal from "../PawnPromotionModal/PawnPromotionModal";
import Referee from "../../referee/Referee";
import { Piece, PieceType, Position, TeamType, initialBoard, samePosition } from "../../Types";
import "./Chessboard.css";

const referee = new Referee();

interface PendingPromotion {
  piece: Piece;
  destination: Position;
}

function applyMove(piece: Piece, destination: Position, boardState: Piece[]): Piece[] {
  const isEnPassantCapture =
    piece.type === PieceType.PAWN &&
    piece.x !== destination.x &&
    !boardState.some((p) => samePosition(p, destination));

  const isCastling = piece.type === PieceType.KING && Math.abs(destination.x - piece.x) === 2;
  const castleDirection = destination.x - piece.x > 0 ? 1 : -1;

  let updated = boardState.filter((p) => {
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
  });

  updated = updated.map((p) => {
    if (samePosition(p, piece)) {
      return {
        ...p,
        x: destination.x,
        y: destination.y,
        hasMoved: true,
        enPassant: p.type === PieceType.PAWN && Math.abs(destination.y - piece.y) === 2,
      };
    }
    return { ...p, enPassant: false };
  });

  if (isCastling) {
    const rook = boardState.find(
      (p) =>
        p.type === PieceType.ROOK &&
        p.team === piece.team &&
        p.y === piece.y &&
        (castleDirection === 1 ? p.x > piece.x : p.x < piece.x)
    );
    if (rook) {
      updated = updated.map((p) =>
        samePosition(p, rook) ? { ...p, x: destination.x - castleDirection, hasMoved: true } : p
      );
    }
  }

  return updated;
}

export default function Chessboard() {
  const chessboardRef = useRef<HTMLDivElement>(null);
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [pieces, setPieces] = useState<Piece[]>(initialBoard);
  const [currentTeam, setCurrentTeam] = useState<TeamType>(TeamType.OUR);
  const [promotion, setPromotion] = useState<PendingPromotion | null>(null);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [inCheckTeam, setInCheckTeam] = useState<TeamType | null>(null);

  function finishTurn(updatedPieces: Piece[]) {
    const nextTeam = currentTeam === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
    setPieces(updatedPieces);
    setCurrentTeam(nextTeam);

    if (referee.isCheckmate(nextTeam, updatedPieces)) {
      setGameOverMessage(`Xeque-mate! Vencem as ${currentTeam === TeamType.OUR ? "brancas" : "pretas"}.`);
      setInCheckTeam(nextTeam);
    } else if (referee.isStalemate(nextTeam, updatedPieces)) {
      setGameOverMessage("Empate por afogamento.");
      setInCheckTeam(null);
    } else if (referee.isKingInCheck(nextTeam, updatedPieces)) {
      setInCheckTeam(nextTeam);
    } else {
      setInCheckTeam(null);
    }
  }

  function grabPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    const element = e.target as HTMLElement;
    if (gameOverMessage || promotion || !chessboard || !element.classList.contains("chess-piece")) return;

    const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
    const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100));

    const piece = pieces.find((p) => samePosition(p, { x: grabX, y: grabY }));
    if (!piece || piece.team !== currentTeam) return;

    setGrabPosition({ x: grabX, y: grabY });
    element.style.position = "absolute";
    element.style.left = `${e.clientX - 50}px`;
    element.style.top = `${e.clientY - 50}px`;
    setActivePiece(element);
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (!activePiece || !chessboard) return;

    const minX = chessboard.offsetLeft - 25;
    const minY = chessboard.offsetTop - 25;
    const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
    const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
    const x = e.clientX - 50;
    const y = e.clientY - 50;

    activePiece.style.left = `${Math.min(Math.max(x, minX), maxX)}px`;
    activePiece.style.top = `${Math.min(Math.max(y, minY), maxY)}px`;
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
      const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100));

      const currentPiece = pieces.find((p) => samePosition(p, grabPosition));

      if (currentPiece && referee.isValidMove(currentPiece, { x, y }, pieces)) {
        const isPromotion = currentPiece.type === PieceType.PAWN && (y === 0 || y === 7);
        const updatedPieces = applyMove(currentPiece, { x, y }, pieces);

        if (isPromotion) {
          setPieces(updatedPieces);
          setPromotion({ piece: { ...currentPiece, x, y }, destination: { x, y } });
        } else {
          finishTurn(updatedPieces);
        }
      }

      activePiece.style.position = "relative";
      activePiece.style.removeProperty("top");
      activePiece.style.removeProperty("left");
    }
    setActivePiece(null);
  }

  function promotePawn(type: PieceType) {
    if (!promotion) return;

    const updatedPieces = pieces.map((p) =>
      samePosition(p, promotion.destination) && p.team === promotion.piece.team && p.type === PieceType.PAWN
        ? { ...p, type, image: `assets/images/${type}_${p.team}.png` }
        : p
    );

    setPromotion(null);
    finishTurn(updatedPieces);
  }

  const grabbedPiece = activePiece ? pieces.find((p) => samePosition(p, grabPosition)) : undefined;
  const legalMoves = grabbedPiece ? referee.getValidMoves(grabbedPiece, pieces) : [];

  const board = [];
  for (let j = 7; j >= 0; j--) {
    for (let i = 0; i < 8; i++) {
      const piece = pieces.find((p) => samePosition(p, { x: i, y: j }));
      const highlight = legalMoves.some((m) => samePosition(m, { x: i, y: j }));
      const check = !!piece && piece.type === PieceType.KING && piece.team === inCheckTeam;

      board.push(
        <Tile key={`${j},${i}`} image={piece?.image} number={i + j + 2} highlight={highlight} check={check} />
      );
    }
  }

  const statusText =
    gameOverMessage ??
    `Vez das ${currentTeam === TeamType.OUR ? "brancas" : "pretas"}${inCheckTeam === currentTeam ? " — xeque!" : ""}`;

  return (
    <div id="chessboard-wrapper">
      <div id="status-bar">{statusText}</div>
      {promotion && <PawnPromotionModal team={promotion.piece.team} onSelect={promotePawn} />}
      <div id="chessboard" ref={chessboardRef} onMouseDown={grabPiece} onMouseMove={movePiece} onMouseUp={dropPiece}>
        {board}
      </div>
    </div>
  );
}
