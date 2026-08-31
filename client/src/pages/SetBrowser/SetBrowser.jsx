import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCardsBySet, getSet } from "../../lib/api";
import CardTile from "./CardTile";
import "./SetBrowser.css";

// Format a DB release_date string (e.g. "2023-09-22") into a human-readable
// string. Appends a midday time component to avoid UTC-midnight timezone
// shifts that can make the date appear one day earlier in UTC- timezones.
function formatReleaseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function SetBrowser() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // What the user is currently typing.
  const [searchTerm, setSearchTerm] = useState("");
  // The search term that was actually sent in the last completed fetch.
  // Used as the CardTile key so tiles only remount when a new result set
  // arrives — not on every keystroke.
  const [appliedSearch, setAppliedSearch] = useState("");

  // Tracks whether we've already restored scroll for the current setId,
  // so it only happens once per visit (not on every re-render, e.g. search).
  const hasRestoredScroll = useRef(false);

  // True while the initial parallel set+cards fetch is in flight.
  // The debounced search effect checks this flag and bails out during the
  // initial load, preventing a duplicate request for the same empty query.
  const isInitialFetch = useRef(true);

  // Holds the setTimeout id for the debounced search so it can be cancelled
  // on the next keystroke or on unmount.
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (set?.name) {
      document.title = `${set.name} — PokeFolio`;
    } else {
      document.title = "Set Browser — PokeFolio";
    }
  }, [set]);

  // Reset per-set state whenever the route param changes.
  // Declared before the initial-load effect so that isInitialFetch is
  // guaranteed to be true when the load effect and the debounced effect
  // both run in the same commit (effects run in declaration order).
  useEffect(() => {
    hasRestoredScroll.current = false;
    isInitialFetch.current = true;
    setSearchTerm("");
    setAppliedSearch("");
    setSet(null);
    setCards([]);
  }, [setId]);

  // Continuously save the scroll position for this set while the user scrolls.
  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(
        `set-browser-scroll-${setId}`,
        String(window.scrollY)
      );
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setId]);

  // Once the set/card content has actually rendered, restore the saved
  // scroll position (if any) exactly once. Card images load asynchronously,
  // so the page may not be tall enough to reach the saved position the
  // instant loading finishes — poll frame-by-frame until it is (or give up
  // after a bounded number of attempts) rather than scrolling too early.
  useEffect(() => {
    if (isLoading || error || hasRestoredScroll.current) {
      return;
    }

    const savedScroll = sessionStorage.getItem(
      `set-browser-scroll-${setId}`
    );

    if (savedScroll === null) {
      hasRestoredScroll.current = true;
      return;
    }

    const targetScroll = Number(savedScroll);
    const maxAttempts = 30; // bounded (~0.5s at 60fps), not an arbitrary sleep
    let attempts = 0;
    let frameId;

    function tryRestore() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= targetScroll || attempts >= maxAttempts) {
        window.scrollTo(0, targetScroll);
        hasRestoredScroll.current = true;
        return;
      }

      attempts += 1;
      frameId = requestAnimationFrame(tryRestore);
    }

    frameId = requestAnimationFrame(tryRestore);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isLoading, error, setId]);

  // ── Initial load ──────────────────────────────────────────────────────────
  // Fetches set metadata and the full card list in a single parallel request
  // when the component mounts or the setId changes. No debounce — fires
  // immediately so the page doesn't sit blank for 300ms on first visit.
  useEffect(() => {
    let cancelled = false;

    async function loadSetAndCards() {
      try {
        setIsLoading(true);
        setError(null);

        const [setData, cardsData] = await Promise.all([
          getSet(setId),
          getCardsBySet(setId, ""),
        ]);

        if (!cancelled) {
          setSet(setData);
          setCards(cardsData);
          setAppliedSearch("");
          // Mark initial fetch complete so the debounced effect is active
          // for subsequent user-driven search changes.
          isInitialFetch.current = false;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          isInitialFetch.current = false;
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSetAndCards();

    return () => {
      cancelled = true;
    };
  }, [setId]);

  // ── Debounced search ──────────────────────────────────────────────────────
  // Fires 300ms after the user stops typing. Skips during the initial load
  // (isInitialFetch.current === true) to avoid a duplicate empty-query
  // request racing the initial parallel fetch.
  // Only refetches cards — set metadata is stable for a given setId.
  useEffect(() => {
    if (isInitialFetch.current) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const term = searchTerm.trim();

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cardsData = await getCardsBySet(setId, term);

        setCards(cardsData);
        setAppliedSearch(term);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, setId]);

  function handleClearSearch() {
    setSearchTerm("");
  }

  function handleSelectCard(cardId) {
    navigate(`/card/${cardId}`);
  }

  const isSearchActive = searchTerm.trim().length > 0;
  const releaseDateFormatted = set ? formatReleaseDate(set.release_date) : null;
  // Prefer set.total (includes secret rares) over printed_total.
  const totalCards = set ? (set.total ?? set.printed_total) : null;

  return (
    <section className="set-browser">
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>

      {/* ── Set Header ──────────────────────────────────────────────── */}
      {set && (
        <div className="set-browser-header">
          <img
            className="set-browser-logo"
            src={set.logo_url}
            alt={`${set.name} logo`}
          />

          <div className="set-browser-header-body">
            <h2 className="set-browser-name">{set.name}</h2>
            <p className="set-browser-series">{set.series}</p>

            {(set.symbol_url || releaseDateFormatted) && (
              <div className="set-browser-meta-row">
                {set.symbol_url && (
                  <img
                    className="set-browser-symbol"
                    src={set.symbol_url}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                {releaseDateFormatted && (
                  <span className="set-browser-release">
                    Released {releaseDateFormatted}
                  </span>
                )}
              </div>
            )}

            <p className="set-browser-count">
              {isSearchActive
                ? `${cards.length} result${cards.length !== 1 ? "s" : ""}`
                : totalCards != null
                  ? `${totalCards} cards`
                  : null}
            </p>
          </div>
        </div>
      )}

      {/* ── Live Search ─────────────────────────────────────────────── */}
      {/* No form wrapper needed — search fires automatically via debounce. */}
      <div className="set-browser-search" role="search">
        <input
          type="search"
          className="set-browser-search-input"
          placeholder="Search cards by name..."
          aria-label="Search cards by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isSearchActive && (
          <button
            type="button"
            className="set-browser-clear-btn"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── States ──────────────────────────────────────────────────── */}
      {isLoading && <p className="set-browser-status">Loading...</p>}

      {!isLoading && error && (
        <p className="set-browser-status set-browser-error">
          Something went wrong: {error}
        </p>
      )}

      {!isLoading && !error && cards.length === 0 && (
        <p className="set-browser-status">
          {isSearchActive
            ? `No cards match "${searchTerm.trim()}".`
            : "No cards are available for this set."}
        </p>
      )}

      {/* ── Card Grid ───────────────────────────────────────────────── */}
      {!isLoading && !error && cards.length > 0 && (
        <div className="set-browser-grid">
          {cards.map((card) => (
            <CardTile
              // Key includes appliedSearch (the term from the last completed
              // fetch) so tiles remount — and replay the reveal animation —
              // when a new search result arrives, but not on every keystroke.
              key={`${card.id}-${appliedSearch}`}
              card={card}
              onSelect={handleSelectCard}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default SetBrowser;
