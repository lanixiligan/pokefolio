const ANON_ID_KEY = "pokefolio_anon_id";

export function getAnonId() {
  const existingId = localStorage.getItem(ANON_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();

  localStorage.setItem(ANON_ID_KEY, newId);

  return newId;
}