import "./CardTile.css";

// Displays one card as a clickable tile.
// Purely presentational: it receives the card data and a click handler as props.
function CardTile({ card, onSelect }) {
  return (
    <button className="card-tile" onClick={() => onSelect(card.id)}>
      <img
        className="card-tile-image"
        src={card.image_small_url}
        alt={card.name}
      />
      <h3 className="card-tile-name">{card.name}</h3>
      <p className="card-tile-meta">
        #{card.number}
        {card.rarity ? ` · ${card.rarity}` : ""}
      </p>
    </button>
  );
}

export default CardTile;
