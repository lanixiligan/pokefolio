function getPageCapacity(binder) {
  const gridDimension = binder.preferences?.gridSize || 3;
  return gridDimension * gridDimension;
}

export function getNextAvailableSlot(binder, currentTarget) {
  if (!binder || !currentTarget) return null;

  const pageCapacity = getPageCapacity(binder);
  const spreads = binder.spreads;
  const currentSpreadIdx = spreads.findIndex(s => s.id === currentTarget.spreadId);
  if (currentSpreadIdx === -1) return null;

  const occupiedSets = new Map();
  const isOccupied = (sIdx, side, pos) => {
    const key = `${sIdx}-${side}`;
    if (!occupiedSets.has(key)) {
      const page = spreads[sIdx].pages.find(p => p.side === side);
      occupiedSets.set(key, new Set((page?.cards || []).map(c => c.position)));
    }
    return occupiedSets.get(key).has(pos);
  };

  let sIdx = currentSpreadIdx;
  let side = currentTarget.pageSide;
  let pos = currentTarget.position + 1;
  let totalSlotsChecked = 0;
  const maxSlots = spreads.length * 2 * pageCapacity;

  while (totalSlotsChecked < maxSlots) {
    if (pos >= pageCapacity) {
      pos = 0;
      side++;
    }
    if (side > 2) {
      side = 1;
      sIdx++;
    }
    if (sIdx >= spreads.length) sIdx = 0;
    if (!isOccupied(sIdx, side, pos)) {
      return { spreadId: spreads[sIdx].id, pageSide: side, position: pos };
    }
    pos++;
    totalSlotsChecked++;
  }
  return "NEW_SPREAD";
}
