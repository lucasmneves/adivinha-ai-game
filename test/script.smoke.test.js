const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

const root = __dirname + "/../";
const ELEMENT_IDS = [
  "score", "best", "level", "combo", "comboStat", "lives", "rangeHint", "feedback",
  "guessForm", "guessInput", "attempts", "history", "overlay", "overlayTitle",
  "overlayText", "restartBtn",
];

// DOM mínimo: só o que o script.js usa.
function createElement(tag) {
  const classes = new Set();
  const listeners = {};
  const el = {
    tagName: tag.toUpperCase(),
    _textContent: "",
    get textContent() {
      return this._textContent;
    },
    // Como no navegador, textContent sempre vira string.
    set textContent(value) {
      this._textContent = String(value);
    },
    value: "",
    disabled: false,
    scrollTop: 0,
    offsetWidth: 0,
    children: [],
    _innerHTML: "",
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(html) {
      this._innerHTML = html;
      if (html === "") this.children = [];
    },
    get className() {
      return [...classes].join(" ");
    },
    set className(value) {
      classes.clear();
      for (const c of String(value).split(/\s+/).filter(Boolean)) classes.add(c);
    },
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !classes.has(c) : force;
        if (on) classes.add(c);
        else classes.delete(c);
        return on;
      },
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    focus() {},
    addEventListener(type, fn) {
      (listeners[type] ||= []).push(fn);
    },
    dispatch(type) {
      const event = { type, preventDefault() {} };
      for (const fn of listeners[type] || []) fn(event);
    },
  };
  return el;
}

function loadGame({ storedBest, random = 0 } = {}) {
  const elements = Object.fromEntries(ELEMENT_IDS.map((id) => [id, createElement("div")]));
  const storage = new Map();
  if (storedBest !== undefined) storage.set("comboHunterBest", String(storedBest));
  const timers = [];

  const context = vm.createContext({
    document: {
      getElementById: (id) => elements[id] || null,
      createElement,
    },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
    },
    setTimeout: (fn) => timers.push(fn),
  });

  // Segredo = 1 + floor(random * range); com o padrão 0 o segredo é sempre 1.
  vm.runInContext(`Math.random = () => ${random};`, context);
  for (const file of ["game-logic.js", "script.js"]) {
    vm.runInContext(fs.readFileSync(root + file, "utf8"), context, { filename: file });
  }

  const game = {
    els: elements,
    storage,
    guess(value) {
      elements.guessInput.value = String(value);
      elements.guessForm.dispatch("submit");
    },
    flushTimers() {
      while (timers.length) timers.shift()();
    },
    loseRound() {
      for (let i = 0; i < 6; i++) game.guess(2);
      game.flushTimers();
    },
  };
  return game;
}

test("script.js carrega e renderiza o estado inicial", () => {
  const { els } = loadGame();
  assert.strictEqual(els.score.textContent, "0");
  assert.strictEqual(els.best.textContent, "0");
  assert.strictEqual(els.level.textContent, "1");
  assert.strictEqual(els.combo.textContent, "x1");
  assert.strictEqual(els.lives.textContent, "❤️❤️❤️");
  assert.strictEqual(els.rangeHint.textContent, "Escolha um número entre 1 e 50");
  assert.strictEqual(els.attempts.children.length, 6);
  assert.strictEqual(els.overlay.classList.contains("show"), false);
});

test("recorde salvo no localStorage aparece ao iniciar", () => {
  const { els } = loadGame({ storedBest: 123 });
  assert.strictEqual(els.best.textContent, "123");
});

test("palpite inválido não consome tentativa", () => {
  const game = loadGame();
  for (const value of ["", "abc", 0, 51]) {
    game.els.guessInput.classList.remove("shake");
    game.guess(value);
    assert.strictEqual(game.els.feedback.textContent, "Digite um número entre 1 e 50", `palpite ${JSON.stringify(value)}`);
    assert.ok(game.els.guessInput.classList.contains("shake"), `shake no palpite ${JSON.stringify(value)}`);
  }
  assert.strictEqual(game.els.history.children.length, 0);
  assert.ok(game.els.attempts.children.every((dot) => !dot.className.includes("used")));
});

test("palpite errado dá dica de direção e marca a tentativa", () => {
  const game = loadGame();
  game.guess(2);
  assert.match(game.els.feedback.textContent, /^Tente um número menor — /);
  assert.strictEqual(game.els.history.children.length, 1);
  assert.strictEqual(game.els.attempts.children[0].className, "attempt-dot used");
  assert.match(game.els.history.children[0].innerHTML, /⬇️ menor/);
});

test("palpite abaixo do segredo pede um número maior", () => {
  // random 0.5 no nível 1 (range 50): segredo = 1 + floor(25) = 26.
  const game = loadGame({ random: 0.5 });
  game.guess(10);
  assert.match(game.els.feedback.textContent, /^Tente um número maior — /);
  assert.strictEqual(game.els.feedback.className, "feedback up");
  assert.strictEqual(game.els.history.children.length, 1);
  assert.match(game.els.history.children[0].innerHTML, /⬆️ maior/);
});

test("acerto soma pontos, sobe combo e nível e salva o recorde", () => {
  const game = loadGame();
  game.guess(1);
  assert.strictEqual(game.els.feedback.textContent, "🎯 Acertou! +60 pontos");
  assert.strictEqual(game.els.score.textContent, "60");
  assert.strictEqual(game.els.combo.textContent, "x2");
  assert.ok(game.els.comboStat.classList.contains("hot"));
  assert.strictEqual(game.els.level.textContent, "2");
  assert.strictEqual(game.storage.get("comboHunterBest"), "60");

  game.flushTimers();
  assert.strictEqual(game.els.rangeHint.textContent, "Escolha um número entre 1 e 75");
  assert.strictEqual(game.els.guessInput.disabled, false);

  // Segundo acerto com combo 1: 60 * 1.25 = 75.
  game.guess(1);
  assert.strictEqual(game.els.score.textContent, "135");
  assert.strictEqual(game.els.combo.textContent, "x3");
});

test("esgotar as tentativas custa uma vida e zera o combo", () => {
  const game = loadGame();
  game.guess(1);
  game.flushTimers();
  for (let i = 0; i < 6; i++) game.guess(2);
  assert.strictEqual(game.els.feedback.textContent, "💥 Fim das tentativas! Era 1.");
  game.flushTimers();
  assert.strictEqual(game.els.lives.textContent, "❤️❤️🖤");
  assert.strictEqual(game.els.combo.textContent, "x1");
  assert.strictEqual(game.els.level.textContent, "2");
  assert.strictEqual(game.els.history.children.length, 0);
});

test("perder todas as vidas mostra o fim de jogo e reiniciar volta ao início", () => {
  const game = loadGame();
  game.guess(1);
  game.flushTimers();
  for (let i = 0; i < 3; i++) game.loseRound();

  assert.ok(game.els.overlay.classList.contains("show"));
  assert.strictEqual(game.els.overlayTitle.textContent, "Fim de jogo");
  assert.strictEqual(game.els.overlayText.textContent, "Pontuação final: 60 • Nível alcançado: 2 • Recorde: 60");

  game.els.restartBtn.dispatch("click");
  assert.strictEqual(game.els.overlay.classList.contains("show"), false);
  assert.strictEqual(game.els.score.textContent, "0");
  assert.strictEqual(game.els.best.textContent, "60");
  assert.strictEqual(game.els.level.textContent, "1");
  assert.strictEqual(game.els.lives.textContent, "❤️❤️❤️");
});
