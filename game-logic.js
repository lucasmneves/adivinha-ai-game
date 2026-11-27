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

/**
 * Calcula os pontos de uma rodada vencida.
 *
 * Base = (maxAttempts - attemptsUsed + 1) * 10, multiplicada por um bônus
 * de 25% por combo e arredondada para o inteiro mais próximo.
 *
 * Contrato: `attemptsUsed` vai de 1 a `maxAttempts`. Fora desse intervalo a
 * base fica ≤ 0 (o jogo nunca chama a função assim).
 *
 * @param {number} attemptsUsed Tentativas usadas para acertar (1..maxAttempts).
 * @param {number} combo Número de acertos seguidos anteriores (≥ 0).
 * @param {number} maxAttempts Máximo de tentativas permitidas na rodada.
 * @returns {number} Pontos da rodada (inteiro).
 */
function roundPoints(attemptsUsed, combo, maxAttempts) {
  const base = (maxAttempts - attemptsUsed + 1) * 10;
  return Math.round(base * (1 + combo * 0.25));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { rangeForLevel, temperature, roundPoints };
}
