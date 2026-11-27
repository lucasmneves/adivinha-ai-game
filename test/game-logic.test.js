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
