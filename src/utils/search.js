function toWords(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreTokenAgainstWords(nameWords, descWords, deptWords, token) {
  if (nameWords.includes(token)) return 3;
  if (nameWords.some((w) => w.startsWith(token))) return 2;
  if (descWords.some((w) => w.includes(token))) return 1;
  if (deptWords.some((w) => w.includes(token))) return 1;
  return 0;
}

export function matchServices(services, query) {
  const tokens = toWords(query);
  if (tokens.length === 0) return [];

  const scored = [];
  services.forEach((service, index) => {
    const nameWords = toWords(service.name);
    const descWords = toWords(service.description);
    const deptWords = toWords(service.department_name);

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
