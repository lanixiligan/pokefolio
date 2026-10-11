function getPageCapacity(binder) {
  const gridDimension = binder.preferences?.gridSize || 3;
  return gridDimension * gridDimension;
}

// Finds where the next added card should go, starting after currentTarget.
// Stays on the spread being viewed while it has any empty slot (slots after
// the target first, then earlier gaps), then moves forward to later spreads.
// It never goes back to an earlier spread, so a card is never placed out of
// view behind the user. Returns "NEW_SPREAD" when no slot is left.
export function getNextAvailableSlot(binder, currentTarget) {
  if (!binder || !currentTarget) return null;

  const pageCapacity = getPageCapacity(binder);
  const slotsPerSpread = pageCapacity * 2;
  const spreads = binder.spreads;
  const currentSpreadIdx = spreads.findIndex(s => s.id === currentTarget.spreadId);
  if (currentSpreadIdx === -1) return null;

  // Slots are numbered 0..slotsPerSpread-1 across both pages of a spread.
  const findFreeSlot = (spread, startIndex) => {
    for (let offset = 0; offset < slotsPerSpread; offset++) {
      const index = (startIndex + offset) % slotsPerSpread;
      const pageSide = Math.floor(index / pageCapacity) + 1;
      const position = index % pageCapacity;
      const page = spread.pages.find(p => p.side === pageSide);
      if (!page?.cards.some(c => c.position === position)) {
        return { spreadId: spread.id, pageSide, position };
      }
    }
    return null;
  };

  const startIndex =
    (currentTarget.pageSide - 1) * pageCapacity + currentTarget.position + 1;
  const sameSpreadSlot = findFreeSlot(spreads[currentSpreadIdx], startIndex);
  if (sameSpreadSlot) return sameSpreadSlot;

  for (let sIdx = currentSpreadIdx + 1; sIdx < spreads.length; sIdx++) {
    const slot = findFreeSlot(spreads[sIdx], 0);
    if (slot) return slot;
  }

  return "NEW_SPREAD";
}
