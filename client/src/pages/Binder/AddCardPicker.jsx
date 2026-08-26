import { useEffect, useState, useRef } from "react";
import { getSets, getCards, addCardToBinder } from "../../lib/api";
import "./AddCardPicker.css";

function AddCardPicker({ activeAddSlot, onClose, onAddSuccess }) {
  const [sets, setSets] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeSetId, setActiveSetId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addStatus, setAddStatus] = useState("idle");
  const [addError, setAddError] = useState(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    async function fetchSets() {
      try {
        const setsData = await getSets();
        setSets(setsData);
      } catch (err) {
        console.error("Failed to load sets:", err);
      }
    }
    fetchSets();
  }, []);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        const cardsData = await getCards(activeSetId, searchQuery);
        setCards(cardsData);
      } catch (err) {
        console.error("Failed to load cards:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchCards();
    }, 300); // debounce

    return () => clearTimeout(searchTimeoutRef.current);
  }, [activeSetId, searchQuery]);

  async function handleCardClick(cardId) {
    if (addStatus === "adding") return;
    
    try {
      setAddStatus("adding");
      setAddError(null);
      
      await addCardToBinder({
        cardId,
        spreadId: activeAddSlot.spreadId,
        pageSide: activeAddSlot.pageSide,
        position: activeAddSlot.position,
      });
      
      onAddSuccess();
    } catch (err) {
      setAddStatus("error");
      setAddError(err.message);
    }
  }

  return (
    <div className="add-card-picker-overlay" onClick={onClose}>
      <div 
        className="add-card-picker" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="add-card-title"
      >
        <div className="add-card-picker-header">
          <h2 id="add-card-title">Add Card</h2>
          <button className="add-card-picker-close" onClick={onClose} aria-label="Close picker">✕</button>
        </div>

        <div className="add-card-picker-controls">
          <input
            type="search"
            className="add-card-picker-search"
            placeholder="Search Pokémon or card name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="add-card-picker-filters">
            <button
              className={`add-card-filter-pill ${activeSetId === "all" ? "active" : ""}`}
              onClick={() => setActiveSetId("all")}
            >
              All Sets
            </button>
            {sets.map((set) => (
              <button
                key={set.id}
                className={`add-card-filter-pill ${activeSetId === set.id ? "active" : ""}`}
                onClick={() => setActiveSetId(set.id)}
              >
                <img src={set.symbol_url} alt="" className="add-card-filter-icon" />
                {set.name}
              </button>
            ))}
          </div>
        </div>

        <div className="add-card-picker-results">
          {addStatus === "error" && (
            <div className="add-card-picker-error">
              {addError || "Failed to add card. Please try again."}
            </div>
          )}
          
          {isLoading ? (
            <p className="add-card-picker-status">Searching...</p>
          ) : cards.length > 0 ? (
            <div className="add-card-grid">
              {cards.map((card) => (
                <button 
                  key={card.id} 
                  className={`add-card-result ${addStatus === 'adding' ? 'disabled' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                  aria-label={`Select ${card.name}`}
                  disabled={addStatus === "adding"}
                >
                  <img src={card.image_small_url} alt={card.name} loading="lazy" />
                </button>
              ))}
            </div>
          ) : (
            <p className="add-card-picker-status">No cards found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCardPicker;
