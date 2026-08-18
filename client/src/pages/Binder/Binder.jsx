import { useEffect, useState } from "react";
import {
  getBinder,
  initializeBinder,
  removeCardFromBinder,
} from "../../lib/api";
import BinderPage from "./BinderPage";
import "./Binder.css";

function Binder() {
  const [binder, setBinder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);

  // Separate state for card removal, so a remove action never blanks
  // the page that has already loaded.
  const [removingCardId, setRemovingCardId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

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

  async function handleRemoveCard(cardId) {
    try {
      setRemovingCardId(cardId);
      setRemoveError(null);

      await removeCardFromBinder(cardId);

      const binderData = await getBinder();
      setBinder(binderData);
    } catch (err) {
      setRemoveError({ cardId, message: err.message });
    } finally {
      setRemovingCardId(null);
    }
  }

  function handlePreviousSpread() {
    setCurrentSpreadIndex((index) => Math.max(0, index - 1));
  }

  function handleNextSpread() {
    setCurrentSpreadIndex((index) =>
      Math.min(binder.spreads.length - 1, index + 1)
    );
  }

  return (
    <section className="binder">
      <h2>Binder</h2>

      {isLoading && <p className="binder-status">Loading your binder...</p>}

      {!isLoading && error && (
        <p className="binder-status binder-error">
          Something went wrong: {error}
        </p>
      )}

      {!isLoading && !error && binder && binder.spreads.length > 0 && (() => {
        // Spreads are already ordered by sortOrder in the API response.
        const spread = binder.spreads[currentSpreadIndex];
        const isFirstSpread = currentSpreadIndex === 0;
        const isLastSpread = currentSpreadIndex === binder.spreads.length - 1;
        const leftPage = spread.pages.find((page) => page.side === 1);
        const rightPage = spread.pages.find((page) => page.side === 2);

        return (
          <>
            <div className="binder-spread-nav">
              <button onClick={handlePreviousSpread} disabled={isFirstSpread}>
                ← Previous
              </button>
              <span>
                Spread {currentSpreadIndex + 1} of {binder.spreads.length}
              </span>
              <button onClick={handleNextSpread} disabled={isLastSpread}>
                Next →
              </button>
            </div>

            <div className="binder-spread">
              {leftPage && (
                <BinderPage
                  page={leftPage}
                  gridSize={binder.preferences.gridSize}
                  removingCardId={removingCardId}
                  removeError={removeError}
                  onRemoveCard={handleRemoveCard}
                />
              )}
              {rightPage && (
                <BinderPage
                  page={rightPage}
                  gridSize={binder.preferences.gridSize}
                  removingCardId={removingCardId}
                  removeError={removeError}
                  onRemoveCard={handleRemoveCard}
                />
              )}
            </div>
          </>
        );
      })()}
    </section>
  );
}

export default Binder;
