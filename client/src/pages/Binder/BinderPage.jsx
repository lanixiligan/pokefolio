import "./BinderPage.css";

// Renders one page (one side of a spread) as a gridSize x gridSize grid.
// Positions are flat integers (0 to gridSize*gridSize - 1); the CSS grid's
// row-major layout places each slot in the correct row/column automatically.
function BinderPage({ page, gridSize, removingCardId, removeError, onRemoveCard }) {
  const cardsByPosition = new Map(
    page.cards.map((entry) => [entry.position, entry.card])
  );

  const totalSlots = gridSize * gridSize;
  const positions = Array.from({ length: totalSlots }, (_, index) => index);

  return (
    <div className="binder-page" style={{ "--binder-grid-size": gridSize }}>
      {positions.map((position) => {
        const card = cardsByPosition.get(position);

        if (!card) {
          return (
            <div key={position} className="binder-slot binder-slot-empty" />
          );
        }

        const isRemoving = removingCardId === card.id;
        const hasError = removeError && removeError.cardId === card.id;

        return (
          <div key={position} className="binder-slot binder-slot-filled">
            <img
              className="binder-slot-image"
              src={card.imageSmallUrl}
              alt={card.name}
            />
            <button
              className="binder-slot-remove"
              onClick={() => onRemoveCard(card.id)}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
            {hasError && (
              <p className="binder-slot-error">{removeError.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BinderPage;
