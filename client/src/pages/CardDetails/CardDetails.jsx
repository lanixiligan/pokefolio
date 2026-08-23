import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addCardToBinder,
  getBinder,
  getCard,
  getSet,
  initializeBinder,
} from "../../lib/api";
import "./CardDetails.css";

// Scans the binder in a stable, predictable order (spreads by sortOrder,
// pages by side, positions from 0 up to the grid limit) and returns the
// first slot that has no card in it yet. Returns null if the binder is full.
function findFirstOpenSlot(binder) {
  const gridSize = binder.preferences.gridSize;
  const maxPosition = gridSize * gridSize - 1;

  const sortedSpreads = [...binder.spreads].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  for (const spread of sortedSpreads) {
    const sortedPages = [...spread.pages].sort((a, b) => a.side - b.side);

    for (const page of sortedPages) {
      const occupiedPositions = new Set(
        page.cards.map((entry) => entry.position)
      );

      for (let position = 0; position <= maxPosition; position++) {
        if (!occupiedPositions.has(position)) {
          return {
            spreadId: spread.id,
            pageSide: page.side,
            position,
          };
        }
      }
    }
  }

  return null;
}

function CardDetails() {
  const { cardId } = useParams();

  const [card, setCard] = useState(null);
  const [set, setSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Separate state for the Add to Binder action, so it never replaces
  // the page content that has already loaded.
  const [addStatus, setAddStatus] = useState("idle"); // idle | adding | success | error
  const [addMessage, setAddMessage] = useState("");

  useEffect(() => {
    if (card?.name) {
      document.title = `${card.name} — PokeFolio`;
    } else {
      document.title = "Card Details — PokeFolio";
    }
  }, [card]);

  useEffect(() => {
    async function loadCardAndSet() {
      try {
        setIsLoading(true);
        setError(null);

        const cardData = await getCard(cardId);
        const setData = await getSet(cardData.set_id);

        setCard(cardData);
        setSet(setData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCardAndSet();
  }, [cardId]);

  async function handleAddToBinder() {
    try {
      setAddStatus("adding");
      setAddMessage("");

      await initializeBinder();

      const binder = await getBinder();
      const slot = findFirstOpenSlot(binder);

      if (!slot) {
        setAddStatus("error");
        setAddMessage("Your binder is full. Add a spread before adding more cards.");
        return;
      }

      await addCardToBinder({
        cardId,
        spreadId: slot.spreadId,
        pageSide: slot.pageSide,
        position: slot.position,
      });

      setAddStatus("success");
      setAddMessage("Added to your binder.");
    } catch (err) {
      setAddStatus("error");
      setAddMessage(err.message);
    }
  }

  return (
    <section className="card-details">
      {card ? (
        <Link to={`/explore/${card.set_id}`} className="back-link">
          ← Back to Set
        </Link>
      ) : (
        <Link to="/explore" className="back-link">
          ← Back to Explore
        </Link>
      )}

      {isLoading && <p className="card-details-status">Loading...</p>}

      {!isLoading && error && (
        <p className="card-details-status card-details-error">
          Something went wrong: {error}
        </p>
      )}

      {!isLoading && !error && card && (
        <div className="card-details-content">
          <img
            className="card-details-image"
            src={card.image_large_url}
            alt={card.name}
          />

          <div className="card-details-info">
            <h2>{card.name}</h2>
            {set && <p className="card-details-set">{set.name}</p>}
            <p>Number: {card.number}</p>
            <p>Supertype: {card.supertype}</p>
            {card.types && card.types.length > 0 && (
              <p>Type: {card.types.join(", ")}</p>
            )}
            {card.rarity && <p>Rarity: {card.rarity}</p>}
            {card.artist && <p>Artist: {card.artist}</p>}

            <button
              className="add-to-binder-button"
              onClick={handleAddToBinder}
              disabled={addStatus === "adding"}
            >
              {addStatus === "adding" ? "Adding..." : "Add to Binder"}
            </button>

            {addStatus === "success" && (
              <p className="add-to-binder-message add-to-binder-success">
                {addMessage}
              </p>
            )}

            {addStatus === "error" && (
              <p className="add-to-binder-message add-to-binder-error">
                {addMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default CardDetails;

