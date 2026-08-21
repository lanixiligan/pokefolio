import "./SetCard.css";

// Displays one set as a clickable, collectible-feeling tile.
// Purely presentational: it receives the set data and a click handler as props.
function SetCard({ set, onSelect, className }) {
  const cardCount = set.total ?? set.printed_total;
  const classNames = className ? `set-card ${className}` : "set-card";

  return (
    <button className={classNames} onClick={() => onSelect(set.id)}>
      <div className="set-card-logo-frame">
        <img
          className="set-card-logo"
          src={set.logo_url}
          alt={`${set.name} logo`}
        />
      </div>

      <div className="set-card-body">
        <h2 className="set-card-name">{set.name}</h2>
        <p className="set-card-series">{set.series}</p>
      </div>

      <div className="set-card-footer">
        {cardCount != null && (
          <span className="set-card-count">{cardCount} cards</span>
        )}
        <span className="set-card-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </button>
  );
}

export default SetCard;
