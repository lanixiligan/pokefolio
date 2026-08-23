import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSets } from "../../lib/api";
import SetCard from "./SetCard";
import "./Explore.css";

function Explore() {
  const [sets, setSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore \u2014 PokeFolio";
  }, []);

  useEffect(() => {
    async function loadSets() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getSets();

        setSets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSets();
  }, []);

  function handleSelectSet(setId) {
    navigate(`/explore/${setId}`);
  }

  return (
    <section className="explore">
      <div className="explore-intro">
        <h1 className="explore-heading">Explore Your Collection</h1>
        <p className="explore-subheading">
          Discover sets and build your personal binder.
        </p>
      </div>

      {isLoading && <p className="explore-status">Loading sets...</p>}

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
          {sets.map((set, index) => {
            const isLastOdd =
              sets.length % 2 !== 0 && index === sets.length - 1;

            return (
              <SetCard
                key={set.id}
                set={set}
                onSelect={handleSelectSet}
                className={isLastOdd ? "set-card-centered" : undefined}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Explore;
