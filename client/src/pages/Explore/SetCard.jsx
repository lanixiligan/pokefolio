import "./SetCard.css";

// Displays one set as a clickable, collectible-feeling tile.
// Purely presentational: receives set data and a click handler as props.
function SetCard({ set, onSelect, className }) {
  const cardCount = set.total ?? set.printed_total;
  const classNames = className ? `set-card ${className}` : "set-card";

  return (
    <button className={classNames} onClick={() => onSelect(set.id)}>
      <div className="set-card-image-zone">
        {/* Series badge: top-left pill giving immediate set classification context */}
        <span className="set-card-series-badge" aria-hidden="true">
          {set.series}
        </span>
        <img
          className="set-card-artwork"
          src={set.logo_url}
          alt={`${set.name} booster pack`}
        />
      </div>

      <div className="set-card-content">
        <h3 className="set-card-name">{set.name}</h3>
        <p className="set-card-meta">
          {set.series}
          {cardCount != null && <> &middot; {cardCount} Cards</>}
        </p>
        <p className="set-card-cta">
          VIEW SET{" "}
          <span className="set-card-arrow" aria-hidden="true">&#x203A;</span>
        </p>
      </div>
    </button>
  );
}

export default SetCard;
