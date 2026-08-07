function scoreServiceForToken(service, token) {
  const nameWords = service.name.toLowerCase().split(/\s+/);
  const descWords = (service.description || "").toLowerCase().split(/\s+/);

  if (nameWords.includes(token)) return 3;
  if (nameWords.some((w) => w.startsWith(token))) return 2;
  if (descWords.some((w) => w.includes(token))) return 1;
  return 0;
}

export function matchServices(services, query) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = [];
  services.forEach((service, index) => {
    let total = 0;
    for (const token of tokens) {
      const tokenScore = scoreServiceForToken(service, token);
      if (tokenScore === 0) return;
      total += tokenScore;
    }
    scored.push({ service, total, index });
  });

  return scored
    .sort((a, b) => b.total - a.total || a.index - b.index)
    .map((s) => s.service);
}
