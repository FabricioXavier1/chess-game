import { PieceType, TeamType } from "../../Types";
import "./PawnPromotionModal.css";

interface Props {
  team: TeamType;
  onSelect: (type: PieceType) => void;
}

const promotionOptions = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];

export default function PawnPromotionModal({ team, onSelect }: Props) {
  return (
    <div className="promotion-modal-overlay">
      <div className="promotion-modal">
        <p>Escolha a peça para promoção</p>
        <div className="promotion-options">
          {promotionOptions.map((type) => (
            <div
              key={type}
              className="promotion-option"
              style={{ backgroundImage: `url(assets/images/${type}_${team}.png)` }}
              onClick={() => onSelect(type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
