import { useState } from "react";
import "./BinderPage.css";

// Renders one page (one side of a spread) as a gridSize x gridSize grid.
// Positions are flat integers (0 to gridSize*gridSize - 1); the CSS grid's
// row-major layout places each slot in the correct row/column automatically.
//
// Each slot supports two ways to move a card, and both call the same
// onSlotClick / onSlotDrop callbacks so the parent Binder only has one
// code path (moveCardInBinder) regardless of how the move was made:
//   - Desktop: native HTML5 drag-and-drop (draggable + onDragStart/onDrop).
//   - Any device: tap-to-move (onClick) - select a card, then tap a slot.
function BinderPage({
  page,
  gridSize,
  removingCardId,
  removeError,
  onRemoveCard,
  movingCardId,
  moveError,
  selectedCardId,
  onSlotClick,
  onSlotDrop,
}) {
  // Tracks which slot is currently being dragged over, purely for visual
  // drop-target feedback. Not app data - resets constantly as the user
  // drags across the grid.
  const [dragOverPosition, setDragOverPosition] = useState(null);

  const cardsByPosition = new Map(
    page.cards.map((entry) => [entry.position, entry.card])
  );

  const totalSlots = gridSize * gridSize;
  const positions = Array.from({ length: totalSlots }, (_, index) => index);

  function handleDragStart(event, cardId) {
    event.dataTransfer.setData("text/plain", String(cardId));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event, position) {
    event.preventDefault(); // required to allow a drop
    setDragOverPosition(position);
  }

  function handleDrop(event, position) {
    event.preventDefault();
    setDragOverPosition(null);

    const draggedCardId = event.dataTransfer.getData("text/plain");

    if (draggedCardId) {
      onSlotDrop(position, draggedCardId);
    }
  }

  return (
    <div
      className={`binder-page binder-page-side-${page.side}`}
      style={{ "--binder-grid-size": gridSize }}
    >
      {positions.map((position) => {
        const card = cardsByPosition.get(position);
        const isDragOver = dragOverPosition === position;

        if (!card) {
          return (
            <div
              key={position}
              className={
                "binder-slot binder-slot-empty" +
                (isDragOver ? " binder-slot-drag-over" : "")
              }
              onDragOver={(event) => handleDragOver(event, position)}
              onDragLeave={() => setDragOverPosition(null)}
              onDrop={(event) => handleDrop(event, position)}
              onClick={() => onSlotClick(position, null)}
            >
              <span className="binder-slot-add-icon" aria-hidden="true">+</span>
            </div>
          );
        }

        const isSelected = selectedCardId === card.id;
        const isRemoving = removingCardId === card.id;
        const isMoving = movingCardId === card.id;
        const hasRemoveError = removeError && removeError.cardId === card.id;
        const hasMoveError = moveError && moveError.cardId === card.id;

        const slotClassName = [
          "binder-slot",
          "binder-slot-filled",
          isDragOver ? "binder-slot-drag-over" : "",
          isSelected ? "binder-slot-selected" : "",
          isMoving ? "binder-slot-moving" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={position}
            className={slotClassName}
            draggable={!isRemoving && !isMoving}
            onDragStart={(event) => handleDragStart(event, card.id)}
            onDragOver={(event) => handleDragOver(event, position)}
            onDragLeave={() => setDragOverPosition(null)}
            onDrop={(event) => handleDrop(event, position)}
            onClick={() => onSlotClick(position, card.id)}
          >
            <img
              className="binder-slot-image"
              src={card.imageSmallUrl}
              alt={card.name}
            />
            <button
              type="button"
              className="binder-slot-remove"
              onClick={(event) => {
                event.stopPropagation(); // don't trigger the slot's onClick
                onRemoveCard(card.id);
              }}
              disabled={isRemoving}
              aria-label={`Remove ${card.name} from binder`}
              title={`Remove ${card.name}`}
            >
              {isRemoving ? "…" : "✕"}
            </button>
            {isSelected && (
              <div className="binder-slot-selected-overlay" aria-live="polite">
                <span className="binder-selected-badge">Selected</span>
                <span className="binder-selected-hint">Choose destination</span>
              </div>
            )}
            {isMoving && <p className="binder-slot-status">Moving...</p>}
            {hasRemoveError && (
              <p className="binder-slot-error">{removeError.message}</p>
            )}
            {hasMoveError && (
              <p className="binder-slot-error">{moveError.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BinderPage;
