import { useEffect, useState } from "react";
import {
  createBinderSpread,
  deleteBinderSpread,
  getBinder,
  initializeBinder,
  moveCardInBinder,
  removeCardFromBinder,
} from "../../lib/api";
import BinderPage from "./BinderPage";
import Customize from "./Customize";
import "./Binder.css";

// Scans every spread/page for a card and returns where it currently sits,
// so we can skip a no-op move (dropping a card back on its own slot) and
// show the selected card's name in the selection banner.
function findCardPlacement(binder, cardId) {
  for (const spread of binder.spreads) {
    for (const page of spread.pages) {
      for (const entry of page.cards) {
        if (entry.card.id === cardId) {
          return {
            spreadId: spread.id,
            pageSide: page.side,
            position: entry.position,
            card: entry.card,
          };
        }
      }
    }
  }

  return null;
}

function Binder() {
  const [binder, setBinder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // The spread the user is currently viewing. Tracked by id (not array
  // index) so creating/deleting spreads can't leave this pointing at the
  // wrong spread.
  const [selectedSpreadId, setSelectedSpreadId] = useState(null);

  // The card currently "picked up" for tap-to-move. Stays set while the
  // user navigates between spreads, so cross-spread moves are possible:
  // select a card, navigate to another spread, tap a destination slot.
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Separate state for card removal, so a remove action never blanks
  // the page that has already loaded.
  const [removingCardId, setRemovingCardId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  // Separate state for move/swap actions (drag-and-drop or tap-to-move).
  const [movingCardId, setMovingCardId] = useState(null);
  const [moveError, setMoveError] = useState(null);

  // Separate state for spread creation/deletion.
  const [isCreatingSpread, setIsCreatingSpread] = useState(false);
  const [createSpreadError, setCreateSpreadError] = useState(null);
  const [isDeletingSpread, setIsDeletingSpread] = useState(false);
  const [deleteSpreadError, setDeleteSpreadError] = useState(null);

  useEffect(() => {
    async function loadBinder() {
      try {
        setIsLoading(true);
        setError(null);

        await initializeBinder();

        const binderData = await getBinder();

        setBinder(binderData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadBinder();
  }, []);

  const spreads = binder ? binder.spreads : [];

  // If selectedSpreadId no longer matches any spread (nothing selected
  // yet, or its spread was just deleted), fall back to the first spread.
  const resolvedSpreadId = spreads.some((spread) => spread.id === selectedSpreadId)
    ? selectedSpreadId
    : spreads[0]?.id ?? null;

  const currentSpreadIndex = spreads.findIndex(
    (spread) => spread.id === resolvedSpreadId
  );
  const currentSpread =
    currentSpreadIndex >= 0 ? spreads[currentSpreadIndex] : null;

  async function refreshBinder() {
    const binderData = await getBinder();
    setBinder(binderData);
  }

  async function handleRemoveCard(cardId) {
    try {
      setRemovingCardId(cardId);
      setRemoveError(null);

      await removeCardFromBinder(cardId);
      await refreshBinder();
    } catch (err) {
      setRemoveError({ cardId, message: err.message });
    } finally {
      setRemovingCardId(null);
    }
  }

  async function handleMoveOrSwapCard(cardId, destination) {
    // Skip the request entirely if the card is already in that exact slot.
    const currentPlacement = findCardPlacement(binder, cardId);

    if (
      currentPlacement &&
      currentPlacement.spreadId === destination.spreadId &&
      currentPlacement.pageSide === destination.pageSide &&
      currentPlacement.position === destination.position
    ) {
      return;
    }

    try {
      setMovingCardId(cardId);
      setMoveError(null);

      await moveCardInBinder(cardId, destination);
      await refreshBinder();
    } catch (err) {
      setMoveError({ cardId, message: err.message });
    } finally {
      setMovingCardId(null);
    }
  }

  // Handles a tap on any slot (empty or occupied), for the mobile /
  // click-based move interaction. Also works on desktop as a fallback
  // alongside drag-and-drop.
  function handleSlotClick(pageSide, position, cardIdAtSlot) {
    if (!selectedCardId) {
      // Nothing selected yet: tapping an occupied slot selects it.
      if (cardIdAtSlot) {
        setSelectedCardId(cardIdAtSlot);
      }
      return;
    }

    if (selectedCardId === cardIdAtSlot) {
      // Tapping the already-selected card again cancels the selection.
      setSelectedCardId(null);
      return;
    }

    // Anything else is a destination: move (or swap, if occupied).
    handleMoveOrSwapCard(selectedCardId, {
      spreadId: currentSpread.id,
      pageSide,
      position,
    });
    setSelectedCardId(null);
  }

  // Handles a native HTML5 drop onto a slot (desktop drag-and-drop).
  // Only reachable within the currently visible spread, since that's
  // the only spread rendered on screen at once.
  function handleSlotDrop(pageSide, position, draggedCardId) {
    handleMoveOrSwapCard(draggedCardId, {
      spreadId: currentSpread.id,
      pageSide,
      position,
    });
  }

  function handlePreviousSpread() {
    if (currentSpreadIndex > 0) {
      setSelectedSpreadId(spreads[currentSpreadIndex - 1].id);
    }
  }

  function handleNextSpread() {
    if (currentSpreadIndex < spreads.length - 1) {
      setSelectedSpreadId(spreads[currentSpreadIndex + 1].id);
    }
  }

  async function handleCreateSpread() {
    try {
      setIsCreatingSpread(true);
      setCreateSpreadError(null);

      const result = await createBinderSpread();

      await refreshBinder();
      setSelectedSpreadId(result.spread.id);
    } catch (err) {
      setCreateSpreadError(err.message);
    } finally {
      setIsCreatingSpread(false);
    }
  }

  async function handleDeleteSpread() {
    try {
      setIsDeletingSpread(true);
      setDeleteSpreadError(null);

      await deleteBinderSpread(currentSpread.id);
      await refreshBinder();
      // No need to update selectedSpreadId here: the fallback logic
      // above will pick the first remaining spread automatically once
      // this spread's id is no longer in binder.spreads.
    } catch (err) {
      setDeleteSpreadError(err.message);
    } finally {
      setIsDeletingSpread(false);
    }
  }

  const selectedCardPlacement =
    binder && selectedCardId ? findCardPlacement(binder, selectedCardId) : null;

  // Preferences are applied as CSS custom properties scoped to this
  // <section> only (via inline style, not :root), so customization never
  // leaks outside the Binder page. Descendant CSS (Binder.css,
  // BinderPage.css) reads these with fallbacks to the app's normal tokens.
  const binderStyle = binder
    ? {
        "--binder-background": binder.preferences.background,
        "--binder-color": binder.preferences.binderColor,
        "--binder-accent": binder.preferences.accentColor,
      }
    : undefined;

  async function handlePreferencesSaved() {
    // Re-fetch the authoritative binder state rather than trusting the
    // save response alone - this also picks up any grid-size reflow.
    await refreshBinder();
  }

  return (
    <section
      className="binder"
      style={binderStyle}
      data-binder-theme={binder ? binder.preferences.theme : undefined}
    >
      <h2>Binder</h2>

      {isLoading && <p className="binder-status">Loading your binder...</p>}

      {!isLoading && error && (
        <p className="binder-status binder-error">
          Something went wrong: {error}
        </p>
      )}

      {!isLoading && !error && binder && (
        <Customize preferences={binder.preferences} onSaved={handlePreferencesSaved} />
      )}

      {!isLoading && !error && currentSpread && (
        <>
          <div className="binder-spread-nav">
            <button
              onClick={handlePreviousSpread}
              disabled={currentSpreadIndex === 0}
            >
              ← Previous
            </button>
            <span>
              Spread {currentSpreadIndex + 1} of {spreads.length}
            </span>
            <button
              onClick={handleNextSpread}
              disabled={currentSpreadIndex === spreads.length - 1}
            >
              Next →
            </button>
          </div>

          <div className="binder-spread-controls">
            <button onClick={handleCreateSpread} disabled={isCreatingSpread}>
              {isCreatingSpread ? "Adding..." : "Add spread"}
            </button>
            <button
              onClick={handleDeleteSpread}
              disabled={isDeletingSpread || spreads.length <= 1}
            >
              {isDeletingSpread ? "Deleting..." : "Delete this spread"}
            </button>
          </div>

          {createSpreadError && (
            <p className="binder-status binder-error">{createSpreadError}</p>
          )}
          {deleteSpreadError && (
            <p className="binder-status binder-error">{deleteSpreadError}</p>
          )}

          {selectedCardPlacement && (
            <div className="binder-selection-banner">
              <span>
                {selectedCardPlacement.card.name} selected — tap a slot to
                move it (on this spread or another).
              </span>
              <button onClick={() => setSelectedCardId(null)}>Cancel</button>
            </div>
          )}

          <div className="binder-spread">
            {currentSpread.pages
              .filter((page) => page.side === 1)
              .map((page) => (
                <BinderPage
                  key={page.side}
                  page={page}
                  gridSize={binder.preferences.gridSize}
                  removingCardId={removingCardId}
                  removeError={removeError}
                  onRemoveCard={handleRemoveCard}
                  movingCardId={movingCardId}
                  moveError={moveError}
                  selectedCardId={selectedCardId}
                  onSlotClick={(position, cardIdAtSlot) =>
                    handleSlotClick(page.side, position, cardIdAtSlot)
                  }
                  onSlotDrop={(position, draggedCardId) =>
                    handleSlotDrop(page.side, position, draggedCardId)
                  }
                />
              ))}
            {currentSpread.pages
              .filter((page) => page.side === 2)
              .map((page) => (
                <BinderPage
                  key={page.side}
                  page={page}
                  gridSize={binder.preferences.gridSize}
                  removingCardId={removingCardId}
                  removeError={removeError}
                  onRemoveCard={handleRemoveCard}
                  movingCardId={movingCardId}
                  moveError={moveError}
                  selectedCardId={selectedCardId}
                  onSlotClick={(position, cardIdAtSlot) =>
                    handleSlotClick(page.side, position, cardIdAtSlot)
                  }
                  onSlotDrop={(position, draggedCardId) =>
                    handleSlotDrop(page.side, position, draggedCardId)
                  }
                />
              ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Binder;
