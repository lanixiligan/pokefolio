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
      <h2>Explore Sets</h2>
      <p>Choose a set to browse its cards.</p>

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
          {sets.map((set) => (
            <SetCard key={set.id} set={set} onSelect={handleSelectSet} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Explore;
