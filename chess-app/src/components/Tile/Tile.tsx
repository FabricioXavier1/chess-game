import "./Tile.css";

interface Props {
  image?: string;
  number: number;
  highlight?: boolean;
  check?: boolean;
}

export default function Tile({ number, image, highlight, check }: Props) {
  const className = [
    "tile",
    number % 2 === 0 ? "black-tile" : "white-tile",
    highlight ? "tile-highlight" : "",
    check ? "tile-check" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
    </div>
  );
}
