const MAX_ATTEMPTS = 6;
const STARTING_LIVES = 3;
const HEART_FULL = "❤️";
const HEART_EMPTY = "🖤";

const els = {
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  level: document.getElementById("level"),
  combo: document.getElementById("combo"),
  comboStat: document.getElementById("comboStat"),
  lives: document.getElementById("lives"),
  rangeHint: document.getElementById("rangeHint"),
  feedback: document.getElementById("feedback"),
  form: document.getElementById("guessForm"),
  input: document.getElementById("guessInput"),
  attempts: document.getElementById("attempts"),
  history: document.getElementById("history"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  restartBtn: document.getElementById("restartBtn"),
};

let state = {};

function rangeForLevel(level) {
  return 50 + (level - 1) * 25;
}

function loadBest() {
  return Number(localStorage.getItem("comboHunterBest") || 0);
}

function saveBest(value) {
  localStorage.setItem("comboHunterBest", String(value));
}

function newRound(preserve) {
  const range = rangeForLevel(state.level);
  state.secret = 1 + Math.floor(Math.random() * range);
  state.attemptsUsed = 0;
  state.lastGuess = null;
  els.rangeHint.textContent = `Escolha um número entre 1 e ${range}`;
  els.feedback.textContent = "Qual é o número?";
  els.feedback.className = "feedback";
  els.history.innerHTML = "";
  renderAttemptDots();
  els.input.value = "";
  els.input.disabled = false;
  els.input.focus();
  if (!preserve) render();
}

function renderAttemptDots() {
  els.attempts.innerHTML = "";
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const dot = document.createElement("div");
    dot.className = "attempt-dot" + (i < state.attemptsUsed ? " used" : "");
    els.attempts.appendChild(dot);
  }
}

function render() {
  els.score.textContent = state.score;
  els.best.textContent = state.best;
  els.level.textContent = state.level;
  els.combo.textContent = `x${1 + state.combo}`;
  els.comboStat.classList.toggle("hot", state.combo > 0);
  els.lives.textContent = HEART_FULL.repeat(state.lives) + HEART_EMPTY.repeat(STARTING_LIVES - state.lives);
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

function endRound(won) {
  if (won) {
    const range = rangeForLevel(state.level);
    const base = (MAX_ATTEMPTS - state.attemptsUsed + 1) * 10;
    const points = Math.round(base * (1 + state.combo * 0.25));
    state.score += points;

    if (state.attemptsUsed <= 3) {
      state.combo += 1;
    } else {
      state.combo = 0;
    }

    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }

    els.feedback.textContent = `🎯 Acertou! +${points} pontos`;
    els.feedback.className = "feedback win";
    els.input.disabled = true;

    state.level += 1;
    render();
    setTimeout(() => newRound(true), 1100);
  } else {
    state.lives -= 1;
    state.combo = 0;
    render();

    if (state.lives <= 0) {
      showGameOver();
    } else {
      els.feedback.textContent = `💥 Fim das tentativas! Era ${state.secret}.`;
      els.feedback.className = "feedback down";
      els.input.disabled = true;
      setTimeout(() => newRound(true), 1400);
    }
  }
}

function showGameOver() {
  els.overlayTitle.textContent = "Fim de jogo";
  els.overlayText.textContent = `Pontuação final: ${state.score} • Nível alcançado: ${state.level} • Recorde: ${state.best}`;
  els.overlay.classList.add("show");
}

function startGame() {
  state = {
    score: 0,
    best: loadBest(),
    level: 1,
    combo: 0,
    lives: STARTING_LIVES,
    secret: null,
    attemptsUsed: 0,
  };
  els.overlay.classList.remove("show");
  render();
  newRound(true);
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const range = rangeForLevel(state.level);
  const raw = els.input.value.trim();
  const guess = Number(raw);

  if (!raw || Number.isNaN(guess) || guess < 1 || guess > range) {
    els.input.classList.remove("shake");
    void els.input.offsetWidth;
    els.input.classList.add("shake");
    els.feedback.textContent = `Digite um número entre 1 e ${range}`;
    els.feedback.className = "feedback down";
    return;
  }

  state.attemptsUsed += 1;
  renderAttemptDots();

  if (guess === state.secret) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${guess}</span><span class="temp">🎯 na mosca!</span>`;
    els.history.appendChild(li);
    endRound(true);
    return;
  }

  const temp = temperature(guess, state.secret, range);
  const direction = guess < state.secret ? "⬆️ maior" : "⬇️ menor";
  const li = document.createElement("li");
  li.innerHTML = `<span>${guess}</span><span class="temp">${temp} · ${direction}</span>`;
  els.history.appendChild(li);
  els.history.scrollTop = 0;

  els.feedback.textContent = `${direction === "⬆️ maior" ? "Tente um número maior" : "Tente um número menor"} — ${temp}`;
  els.feedback.className = "feedback " + (guess < state.secret ? "up" : "down");

  els.input.value = "";
  els.input.focus();

  if (state.attemptsUsed >= MAX_ATTEMPTS) {
    endRound(false);
  }
});

els.restartBtn.addEventListener("click", startGame);

startGame();
