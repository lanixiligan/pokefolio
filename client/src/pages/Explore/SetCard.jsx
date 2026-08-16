import "./SetCard.css";

// Displays one set as a clickable tile.
// Purely presentational: it receives the set data and a click handler as props.
function SetCard({ set, onSelect }) {
  return (
    <button className="set-card" onClick={() => onSelect(set.id)}>
      <img
        className="set-card-logo"
        src={set.logo_url}
        alt={`${set.name} logo`}
      />
      <h2 className="set-card-name">{set.name}</h2>
      <p className="set-card-series">{set.series}</p>
    </button>
  );
}

export default SetCard;
