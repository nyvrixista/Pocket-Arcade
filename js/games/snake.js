const canvas = document.getElementById("snake-canvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("snake-overlay");
const scoreDisplay = document.getElementById("snake-score");
const bestDisplay = document.getElementById("snake-best");
const message = document.getElementById("snake-message");

const SIZE = 20;
const CELLS = canvas.width / SIZE;

let snake;
let food;
let direction;
let nextDirection;
let score;
let running = false;
let timer = null;

let best = Number(localStorage.getItem("pa-snake-best") || 0);
bestDisplay.textContent = best;

function randomFood() {
    let position;

    do {
        position = {
            x: Math.floor(Math.random() * CELLS),
            y: Math.floor(Math.random() * CELLS)
        };
    } while (snake.some(part =>
        part.x === position.x && part.y === position.y
    ));

    return position;
}

function draw() {
  ctx.fillStyle = "#0c1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ffffff08";

  for (let i = 0; i <= CELLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * SIZE, 0);
    ctx.lineTo(i * SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * SIZE);
    ctx.lineTo(canvas.width, i * SIZE);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffcf58";
  ctx.shadowColor = "#ffcf58";
  ctx.shadowBlur = 12;
  ctx.fillRect(
    food.x * SIZE + 4,
    food.y * SIZE + 4,
    SIZE - 8,
    SIZE - 8
  );

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#00e5ff" : "#35cba2";
    ctx.shadowColor = index === 0 ? "#00e5ff" : "#35cba2";
    ctx.shadowBlur = index === 0 ? 12 : 4;

    ctx.fillRect(
      part.x * SIZE + 2,
      part.y * SIZE + 2,
      SIZE - 4,
      SIZE - 4
    );
  });

  ctx.shadowBlur = 0;
}

function resetGame() {
  clearInterval(timer);
  running = false;

  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;

  scoreDisplay.textContent = score;
  food = randomFood();
  draw();
}

function endGame() {
  running = false;
  clearInterval(timer);

  if (score > best) {
    best = score;
    localStorage.setItem("pa-snake-best", best);
    bestDisplay.textContent = best;
  }

  message.textContent = "GAME OVER — SCORE: " + score;
  saveArcadeResult("snake", score);
}

function tick() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const ateFood = head.x === food.x && head.y === food.y;

  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);

  if (
    head.x < 0 || head.x >= CELLS ||
    head.y < 0 || head.y >= CELLS ||
    bodyToCheck.some(part =>
      part.x === head.x && part.y === head.y
    )
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (ateFood) {
    score += 10;
    scoreDisplay.textContent = score;
    food = randomFood();

    if (score > best) {
      best = score;
      bestDisplay.textContent = best;
      localStorage.setItem("pa-snake-best", best);
    }
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  resetGame();
  running = true;
  message.textContent = "GOOD LUCK!";
  timer = setInterval(tick, 115);
}

function openGame() {
  overlay.hidden = false;
  resetGame();
  message.textContent = "Press START to play";
}

function closeGame() {
  overlay.hidden = true;
  running = false;
  clearInterval(timer);
}

document.querySelectorAll('[data-game="snake"]').forEach(button => {
  button.addEventListener("click", openGame);
});

document.getElementById("close-snake").addEventListener("click", closeGame);
document.getElementById("snake-start").addEventListener("click", startGame);
document.getElementById("snake-restart").addEventListener("click", startGame);

overlay.addEventListener("click", event => {
  if (event.target === overlay) closeGame();
});

document.addEventListener("keydown", event => {
  if (overlay.hidden) return;

  const keys = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const chosen = keys[event.key] || keys[event.key.toLowerCase()];
  if (!chosen) {
    if (event.key === "Escape") closeGame();
    return;
  }

  event.preventDefault();

  if (
    chosen.x !== -direction.x ||
    chosen.y !== -direction.y
  ) {
    nextDirection = chosen;
  }
});

resetGame();

function saveArcadeResult(game, result) {
  const results = JSON.parse(
    localStorage.getItem("pa-results") || "{}"
  );

  const previous = results[game] || { best: 0, plays: 0 };
  results[game] = {
    best: Math.max(previous.best, result),
    plays: previous.plays + 1
  };

  localStorage.setItem("pa-results", JSON.stringify(results));
}