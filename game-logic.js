function rangeForLevel(level) {
  return 50 + (level - 1) * 25;
}

function temperature(guess, secret, range) {
  const distance = Math.abs(guess - secret);
  const pct = distance / range;
  if (pct === 0) return "🎯";
  if (pct < 0.03) return "🔥 muito quente";
  if (pct < 0.08) return "🌡️ quente";
  if (pct < 0.18) return "🙂 morno";
  if (pct < 0.35) return "❄️ frio";
  return "🧊 muito frio";
}

function roundPoints(attemptsUsed, combo, maxAttempts) {
  const base = (maxAttempts - attemptsUsed + 1) * 10;
  return Math.round(base * (1 + combo * 0.25));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { rangeForLevel, temperature, roundPoints };
}
