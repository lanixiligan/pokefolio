import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCardsBySet, getSet } from "../../lib/api";
import CardTile from "./CardTile";
import "./SetBrowser.css";

function SetBrowser() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // What the user is currently typing.
  const [searchTerm, setSearchTerm] = useState("");
  // The search actually applied to the last fetch (updated on submit only).
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    async function loadSetAndCards() {
      try {
        setIsLoading(true);
        setError(null);

        const [setData, cardsData] = await Promise.all([
          getSet(setId),
          getCardsBySet(setId, submittedSearch),
        ]);

        setSet(setData);
        setCards(cardsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSetAndCards();
  }, [setId, submittedSearch]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSubmittedSearch(searchTerm.trim());
  }

  function handleClearSearch() {
    setSearchTerm("");
    setSubmittedSearch("");
  }

  function handleSelectCard(cardId) {
    navigate(`/card/${cardId}`);
  }

  return (
    <section className="set-browser">
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>

      {isLoading && <p className="set-browser-status">Loading...</p>}

      {!isLoading && error && (
        <p className="set-browser-status set-browser-error">
          Something went wrong: {error}
        </p>
      )}

      {!isLoading && !error && (
        <>
          {set && (
            <div className="set-browser-header">
              <img
                className="set-browser-logo"
                src={set.logo_url}
                alt={`${set.name} logo`}
              />
              <h2>{set.name}</h2>
              <p className="set-browser-series">{set.series}</p>
              <p className="set-browser-totals">
                  {cards.length} / {set.total} cards
              </p>
            </div>
          )}

          <form className="set-browser-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search cards by name..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit">Search</button>
            {submittedSearch && (
              <button type="button" onClick={handleClearSearch}>
                Clear
              </button>
            )}
          </form>

          {cards.length === 0 && (
            <p className="set-browser-status">
              {submittedSearch
                ? `No cards match "${submittedSearch}".`
                : "No cards are available for this set."}
            </p>
          )}

          {cards.length > 0 && (
            <div className="set-browser-grid">
              {cards.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  onSelect={handleSelectCard}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SetBrowser;
