import { CATEGORIES_FULL } from "../data/services";

// Maps department_id to the friendlier office label shown on the homepage's
// office pills (e.g. "Planning & Development"), which often reads nothing
// like the backend's formal department_name (e.g. "Municipal Planning &
// Development Office (MPDO)") — so a search for the pill's own wording works.
const OFFICE_LABEL_BY_DEPARTMENT_ID = Object.fromEntries(
  CATEGORIES_FULL.map((c) => [c.id, c.label])
);

function toWords(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j++) dist[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + cost
      );
    }
  }
  return dist[rows - 1][cols - 1];
}

// Typo tolerance for words close enough to a token to plausibly be a misspelling
// (e.g. "helth" -> "health", "asessor" -> "assessor"). Skipped for short tokens,
// where a distance-1 "match" is more likely a different word than a typo.
function isFuzzyMatch(word, token) {
  if (token.length < 4) return false;
  const maxDistance = token.length <= 5 ? 1 : 2;
  return Math.abs(word.length - token.length) <= maxDistance && levenshtein(word, token) <= maxDistance;
}

function scoreTokenAgainstWords(nameWords, descWords, deptWords, token) {
  if (nameWords.includes(token)) return 3;
  if (nameWords.some((w) => w.startsWith(token))) return 2;
  if (descWords.some((w) => w.includes(token))) return 1;
  if (deptWords.some((w) => w.includes(token))) return 1;
  if (nameWords.some((w) => isFuzzyMatch(w, token)) || deptWords.some((w) => isFuzzyMatch(w, token))) return 1;
  return 0;
}

export function matchServices(services, query) {
  const tokens = toWords(query);
  if (tokens.length === 0) return [];

  const scored = [];
  services.forEach((service, index) => {
    const nameWords = toWords(service.name);
    const descWords = toWords(service.description);
    const deptWords = [
      ...toWords(service.department_name),
      ...toWords(OFFICE_LABEL_BY_DEPARTMENT_ID[service.department_id]),
    ];

    let total = 0;
    for (const token of tokens) {
      const tokenScore = scoreTokenAgainstWords(nameWords, descWords, deptWords, token);
      if (tokenScore === 0) return;
      total += tokenScore;
    }
    scored.push({ service, total, index });
  });

  return scored
    .sort((a, b) => b.total - a.total || a.index - b.index)
    .map((s) => s.service);
}
