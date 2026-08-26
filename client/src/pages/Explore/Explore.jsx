import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSets } from "../../lib/api";
import SetCard from "./SetCard";
import "./Explore.css";

// Module-level session flag: ensures the initial branded loading screen
// only appears when the application is first loaded on /explore, and never
// on subsequent client-side navigation within the SPA session.
let hasInitialAppLoaded = false;

function Explore() {
  const [sets, setSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInitialLoader, setShowInitialLoader] = useState(!hasInitialAppLoaded);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore \u2014 PokeFolio";
  }, []);

  useEffect(() => {
    let unmounted = false;
    let fadeTimerId;

    async function loadSets() {
      const isFirstAppLoad = !hasInitialAppLoaded;
      const minDuration = isFirstAppLoad ? 1600 : 0;
      const minTimerPromise = new Promise((resolve) =>
        setTimeout(resolve, minDuration)
      );

      try {
        setIsLoading(true);
        setError(null);

        // Run data fetching alongside minimum duration timer on initial load
        const [data] = await Promise.all([getSets(), minTimerPromise]);

        if (!unmounted) {
          setSets(data);
        }
      } catch (err) {
        // Respect minimum display duration even on error during initial load
        await minTimerPromise.catch(() => { });
        if (!unmounted) {
          setError(err.message);
        }
      } finally {
        if (!unmounted) {
          setIsLoading(false);
          if (isFirstAppLoad) {
            hasInitialAppLoaded = true;
            setIsFadingOut(true);
            fadeTimerId = setTimeout(() => {
              if (!unmounted) {
                setShowInitialLoader(false);
              }
            }, 250);
          }
        }
      }
    }

    loadSets();

    return () => {
      unmounted = true;
      if (fadeTimerId) clearTimeout(fadeTimerId);
    };
  }, []);

  function handleSelectSet(setId) {
    navigate(`/explore/${setId}`);
  }

  return (
    <>
      {showInitialLoader && (
        <div
          className={`poke-initial-loader ${isFadingOut ? "is-fading-out" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Loading PokeFolio"
        >
          <div className="poke-initial-loader-content">
            <div className="poke-initial-loader-logo" aria-hidden="true">
              <svg
                className="poke-initial-logo-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="4"
                  className="loader-logo-card-back"
                />
                <path
                  d="M3 12H21"
                  className="loader-logo-card-line"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  className="loader-logo-card-core"
                />
              </svg>
            </div>

            <div className="poke-initial-loader-brand">
              <span className="brand-poke">Poke</span>
              <span className="brand-folio">Folio</span>
            </div>

            <p className="poke-initial-loader-subtitle">
              Your Digital Pokémon TCG Binder
            </p>

            <div className="poke-initial-loader-line" aria-hidden="true">
              <div className="poke-initial-loader-beam" />
            </div>
          </div>
        </div>
      )}

      <section className="explore">
        <div className="explore-intro">
          <p className="explore-kicker">Pok&eacute;mon TCG &middot; Set Catalog</p>
          <h1 className="explore-heading">Explore Your Collection</h1>
          <p className="explore-subheading">
            Discover sets and build your personal binder.
          </p>
        </div>

        {isLoading && !showInitialLoader && (
          <p className="explore-status">Loading sets...</p>
        )}

        {!isLoading && error && (
          <p className="explore-status explore-error">
            Something went wrong loading sets: {error}
          </p>
        )}

        {!isLoading && !error && sets.length === 0 && (
          <p className="explore-status">No sets are available right now.</p>
        )}

        {!isLoading && !error && sets.length > 0 && (
          <div className="explore-grid">
            {sets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                onSelect={handleSelectSet}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Explore;
