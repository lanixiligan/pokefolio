import { useEffect, useRef, useState } from "react";
import "./CardTile.css";

// Displays one card as a clickable tile with a scroll-triggered reveal.
// Uses IntersectionObserver to reveal the card only when it enters the
// viewport. Observes once per mount then self-unobserves — already-revealed
// cards never replay. Remounting on search-key changes gives new cards
// their own fresh reveal cycle.
function CardTile({ card, onSelect }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: reveal immediately, no transition or observer needed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      // 10% of the card must be visible before revealing.
      // rootMargin bottom -20px delays trigger slightly past the fold
      // so the animation is perceptible as the user scrolls.
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, []); // empty deps: runs once per mount; key-driven remount handles search changes

  return (
    <button
      ref={ref}
      className={`card-tile ${isRevealed ? "card-tile--visible" : "card-tile--hidden"}`}
      onClick={() => onSelect(card.id)}
    >
      <img
        className="card-tile-image"
        src={card.image_small_url}
        alt={card.name}
      />
      <h3 className="card-tile-name">{card.name}</h3>
      <p className="card-tile-meta">
        #{card.number}
        {card.rarity ? ` \u00b7 ${card.rarity}` : ""}
      </p>
    </button>
  );
}

export default CardTile;
