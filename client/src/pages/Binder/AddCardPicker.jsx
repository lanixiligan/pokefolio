import { useEffect, useState, useRef, useMemo } from "react";
import { getSets, getCards, addCardToBinder, createBinderSpread } from "../../lib/api";
import "./AddCardPicker.css";

// Simple Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getPageCapacity(binder) {
  const gridDimension = binder.preferences?.gridSize || 3;
  return gridDimension * gridDimension;
}

export function getNextAvailableSlot(binder, currentTarget) {
  if (!binder || !currentTarget) return null;

  const pageCapacity = getPageCapacity(binder);
  const spreads = binder.spreads;

  const currentSpreadIdx = spreads.findIndex(s => s.id === currentTarget.spreadId);
  if (currentSpreadIdx === -1) return null;

  // Cache occupied positions for fast lookup
  const occupiedSets = new Map();
  const isOccupied = (sIdx, side, pos) => {
    const key = `${sIdx}-${side}`;
    if (!occupiedSets.has(key)) {
      const page = spreads[sIdx].pages.find(p => p.side === side);
      occupiedSets.set(key, new Set((page?.cards || []).map(c => c.position)));
    }
    return occupiedSets.get(key).has(pos);
  };

  let sIdx = currentSpreadIdx;
  let side = currentTarget.pageSide;
  let pos = currentTarget.position + 1;

  let totalSlotsChecked = 0;
  const maxSlots = spreads.length * 2 * pageCapacity;

  while (totalSlotsChecked < maxSlots) {
    if (pos >= pageCapacity) {
      pos = 0;
      side++;
    }

    if (side > 2) {
      side = 1;
      sIdx++;
    }

    if (sIdx >= spreads.length) {
      sIdx = 0;
    }

    if (!isOccupied(sIdx, side, pos)) {
      return { spreadId: spreads[sIdx].id, pageSide: side, position: pos };
    }

    pos++;
    totalSlotsChecked++;
  }

  return "NEW_SPREAD";
}

function AddCardPicker({ binder, activeAddSlot, onClose, onAddSuccess, refreshBinder }) {
  const [layoutState, setLayoutState] = useState({ mode: 'mobile', rect: null });

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth <= 640) {
        setLayoutState({ mode: 'mobile', rect: null });
        return;
      }
      const folio = document.querySelector('.binder-folio');
      if (folio) {
        const rect = folio.getBoundingClientRect();
        // Check if there is enough room to the right of the folio for the panel.
        // We want at least 320px for the panel + 24px gap = 344px.
        const availableSpace = window.innerWidth - rect.right;
        if (availableSpace >= 344) {
          setLayoutState({ mode: 'desktop', rect });
        } else {
          setLayoutState({ mode: 'tablet', rect: null });
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    
    let observer;
    if (window.ResizeObserver) {
      observer = new ResizeObserver(updateLayout);
      const folio = document.querySelector('.binder-folio');
      if (folio) observer.observe(folio);
    }
    
    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) observer.disconnect();
    };
  }, []);
  const [sets, setSets] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeSetId, setActiveSetId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showNewSpreadPrompt, setShowNewSpreadPrompt] = useState(false);
  const [isCreatingSpread, setIsCreatingSpread] = useState(false);

  // Feedback state: { type: 'success' | 'error', message: string, cardId?: string } | null
  const [feedback, setFeedback] = useState(null);
  const [addingCardId, setAddingCardId] = useState(null);

  // Track if we have successfully added at least one card in this session
  const [hasAddedCard, setHasAddedCard] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Compute existing card IDs in the binder
  const existingCardIds = useMemo(() => {
    const ids = new Set();
    if (!binder) return ids;
    for (const spread of binder.spreads) {
      for (const page of spread.pages) {
        for (const entry of page.cards) {
          ids.add(entry.card.id);
        }
      }
    }
    return ids;
  }, [binder]);

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

        // Randomize the results if we're viewing "All Cards" without a search query
        if (activeSetId === "all" && !searchQuery) {
          setCards(shuffleArray(cardsData));
        } else {
          setCards(cardsData);
        }
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

  // Clear feedback when search or set filter changes
  useEffect(() => {
    setFeedback(null);
    if (activeAddSlot === "NEW_SPREAD") {
      setShowNewSpreadPrompt(true);
    }
  }, [activeSetId, searchQuery, activeAddSlot]);

  async function handleCardClick(card) {
    if (addingCardId) return; // Prevent concurrent additions
    if (existingCardIds.has(card.id)) return; // Prevent adding duplicates

    try {
      setAddingCardId(card.id);
      setFeedback(null);

      // 1. Fetch authoritative state before adding
      const currentBinder = await refreshBinder();

      // 2. Verify destination
      let target = activeAddSlot;
      const isSlotOccupied = (b, t) => {
        if (!t || t === "NEW_SPREAD") return false;
        const spread = b.spreads.find(s => s.id === t.spreadId);
        const page = spread?.pages.find(p => p.side === t.pageSide);
        return page?.cards.some(c => c.position === t.position);
      };

      if (isSlotOccupied(currentBinder, target)) {
        // Find next genuinely empty slot by checking from target position itself
        target = getNextAvailableSlot(currentBinder, { ...target, position: target.position - 1 });
      }

      if (target === "NEW_SPREAD") {
        setShowNewSpreadPrompt(true);
        return;
      }

      await addCardToBinder({
        cardId: card.id,
        spreadId: target.spreadId,
        pageSide: target.pageSide,
        position: target.position,
      });

      // Fetch fresh state again for next calculation
      const freshBinder = await refreshBinder();

      // Calculate next available slot
      let nextSlot = getNextAvailableSlot(freshBinder, target);

      if (nextSlot === "NEW_SPREAD") {
        setShowNewSpreadPrompt(true);
        setFeedback({ type: 'success', message: `Added ${card.name}` });
      } else {
        setHasAddedCard(true);
        setFeedback({ type: 'success', message: `Added ${card.name}` });
        onAddSuccess(nextSlot);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message, cardId: card.id });
    } finally {
      setAddingCardId(null);
    }
  }

  async function handleCreateNewSpread() {
    try {
      setIsCreatingSpread(true);
      setFeedback(null);
      const result = await createBinderSpread();
      await refreshBinder();

      setShowNewSpreadPrompt(false);
      setHasAddedCard(true);
      setFeedback({ type: 'success', message: `New spread created` });

      const nextSlot = { spreadId: result.spread.id, pageSide: 1, position: 0 };
      onAddSuccess(nextSlot);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsCreatingSpread(false);
    }
  }

  function handleCancelNewSpread() {
    setShowNewSpreadPrompt(false);
  }



  let panelStyle = undefined;
  if (layoutState.mode === 'desktop' && layoutState.rect) {
    panelStyle = {
      position: 'fixed',
      top: `${layoutState.rect.top}px`,
      left: `${layoutState.rect.right + 24}px`,
      height: `${layoutState.rect.height}px`,
      width: 'auto',
      maxWidth: '360px',
      right: '24px' // Ensure it doesn't overflow right edge
    };
  } else if (layoutState.mode === 'tablet') {
    panelStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      height: 'auto',
      maxHeight: '80vh',
      right: 'auto',
      bottom: 'auto'
    };
  }

  return (
    <div className="add-card-picker" style={panelStyle} role="region" aria-label="Add Card panel">
      <div className="add-card-picker-header">
        <h2 id="add-card-title">Add Card</h2>
        <button className="add-card-picker-close" onClick={onClose} aria-label="Close Add Card">✕</button>
      </div>

      {showNewSpreadPrompt ? (
        <div className="add-card-spread-prompt-full">
          <h3>Spread Full</h3>
          <p>This spread is completely full. Would you like to add a new spread?</p>
          <div className="add-card-spread-actions">
            <button
              className="add-card-btn-primary"
              onClick={handleCreateNewSpread}
              disabled={isCreatingSpread}
            >
              {isCreatingSpread ? "Adding..." : "Add New Spread"}
            </button>
            <button
              className="add-card-btn-secondary"
              onClick={handleCancelNewSpread}
              disabled={isCreatingSpread}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
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
                All Cards
              </button>
              {sets.map((set) => (
                <button
                  key={set.id}
                  className={`add-card-filter-pill ${activeSetId === set.id ? "active" : ""}`}
                  onClick={() => setActiveSetId(set.id)}
                >
                  {set.logo ? (
                    <img src={set.logo} alt="" className="add-card-filter-icon" />
                  ) : null}
                  {set.name}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`add-card-feedback ${feedback.type}`}>
              {feedback.message}
            </div>
          )}

          <div className="add-card-picker-results">
            {isLoading ? (
              <p className="add-card-picker-status">Loading cards...</p>
            ) : cards.length === 0 ? (
              <p className="add-card-picker-status">No cards found matching your search.</p>
            ) : (
              <div className="add-card-grid">
                {cards.map((card) => {
                  const isAdding = addingCardId === card.id;
                  const isExisting = existingCardIds.has(card.id);
                  return (
                    <button
                      key={card.id}
                      className={`add-card-result ${isExisting ? 'already-in-binder' : ''} ${isAdding ? 'disabled' : ''}`}
                      onClick={() => handleCardClick(card)}
                      disabled={isAdding || isExisting}
                      aria-label={`Add ${card.name} to Binder`}
                    >
                      <img src={card.image_small_url} alt={card.name} loading="lazy" />
                      {isAdding && (
                        <div className="adding-overlay">
                          <span>Adding...</span>
                        </div>
                      )}
                      {isExisting && !isAdding && (
                        <div className="already-in-binder-overlay">
                          <span>In Binder</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AddCardPicker;

