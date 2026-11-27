const test = require("node:test");
const assert = require("node:assert");
const { rangeForLevel, temperature, roundPoints } = require("../game-logic.js");

test("rangeForLevel começa em 50 e cresce 25 por nível", () => {
  assert.strictEqual(rangeForLevel(1), 50);
  assert.strictEqual(rangeForLevel(2), 75);
  assert.strictEqual(rangeForLevel(3), 100);
  assert.strictEqual(rangeForLevel(10), 275);
});

test("temperature retorna 🎯 quando acerta", () => {
  assert.strictEqual(temperature(42, 42, 100), "🎯");
});

test("temperature respeita os limites de cada faixa", () => {
  const range = 100;
  const secret = 50;
  const cases = [
    [1, "🔥 muito quente"],
    [2, "🔥 muito quente"],
    [3, "🌡️ quente"],
    [7, "🌡️ quente"],
    [8, "🙂 morno"],
    [17, "🙂 morno"],
    [18, "❄️ frio"],
    [34, "❄️ frio"],
    [35, "🧊 muito frio"],
    [49, "🧊 muito frio"],
  ];
  for (const [distance, expected] of cases) {
    assert.strictEqual(temperature(secret + distance, secret, range), expected, `distância +${distance}`);
    assert.strictEqual(temperature(secret - distance, secret, range), expected, `distância -${distance}`);
  }
});

function assertBoundaries(range, secret, cases) {
  for (const [distance, expected] of cases) {
    assert.strictEqual(temperature(secret + distance, secret, range), expected, `range ${range}, distância +${distance}`);
    assert.strictEqual(temperature(secret - distance, secret, range), expected, `range ${range}, distância -${distance}`);
  }
}

test("temperature respeita os cortes com range 50", () => {
  // cortes: 0.03 → 1.5, 0.08 → 4, 0.18 → 9, 0.35 → 17.5
  assertBoundaries(50, 25, [
    [1, "🔥 muito quente"],
    [2, "🌡️ quente"],
    [3, "🌡️ quente"],
    [4, "🙂 morno"],
    [8, "🙂 morno"],
    [9, "❄️ frio"],
    [17, "❄️ frio"],
    [18, "🧊 muito frio"],
  ]);
});

test("temperature respeita os cortes com range 75", () => {
  // cortes: 0.03 → 2.25, 0.08 → 6, 0.18 → 13.5, 0.35 → 26.25
  assertBoundaries(75, 38, [
    [2, "🔥 muito quente"],
    [3, "🌡️ quente"],
    [5, "🌡️ quente"],
    [6, "🙂 morno"],
    [13, "🙂 morno"],
    [14, "❄️ frio"],
    [26, "❄️ frio"],
    [27, "🧊 muito frio"],
  ]);
});

test("temperature é relativa ao tamanho do intervalo", () => {
  assert.strictEqual(temperature(6, 1, 50), "🙂 morno");
  assert.strictEqual(temperature(6, 1, 200), "🔥 muito quente");
});

test("roundPoints dá mais pontos para menos tentativas", () => {
  assert.strictEqual(roundPoints(1, 0, 6), 60);
  assert.strictEqual(roundPoints(3, 0, 6), 40);
  assert.strictEqual(roundPoints(6, 0, 6), 10);
});

test("roundPoints aplica bônus de 25% por combo", () => {
  assert.strictEqual(roundPoints(1, 1, 6), 75);
  assert.strictEqual(roundPoints(3, 2, 6), 60);
  assert.strictEqual(roundPoints(2, 4, 6), 100);
});

test("roundPoints arredonda o resultado", () => {
  assert.strictEqual(roundPoints(6, 1, 6), 13);
  assert.strictEqual(roundPoints(5, 3, 6), 35);
});
