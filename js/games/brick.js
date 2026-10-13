const brickCanvas = document.getElementById("brick-canvas");
const brickCtx = brickCanvas.getContext("2d");

const brickOverlay = document.getElementById("brick-overlay");
const brickScoreDisplay = document.getElementById("brick-score");
const brickBestDisplay = document.getElementById("brick-best");
const brickMessage = document.getElementById("brick-message");

const BW = brickCanvas.width;
const BH = brickCanvas.height;

let brickPaddle;
let brickBall;
let brickBlocks = [];
let brickKeys = {};
let brickScore = 0;
let brickBest = Number(localStorage.getItem("pa-brick-best") || 0);
let brickRunning = false;
let brickAnimation = null;
let brickLastTime = 0;

brickBestDisplay.textContent = brickBest;

function resetBrick() {
  cancelAnimationFrame(brickAnimation);

  brickRunning = false;
  brickScore = 0;
  brickKeys = {};
  brickLastTime = 0;

  brickPaddle = {
    x: BW / 2 - 45,
    y: BH - 35,
    width: 90,
    height: 12,
    speed: 340
  };

  brickBall = {
    x: BW / 2,
    y: BH - 60,
    radius: 7,
    vx: 145,
    vy: -190
  };

  brickBlocks = [];

  const rows = 5;
  const columns = 8;
  const width = 42;
  const height = 16;
  const gap = 6;
  const left = 11;
  const top = 48;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      brickBlocks.push({
        x: left + col * (width + gap),
        y: top + row * (height + gap),
        width,
        height,
        active: true,
        color: ["#a855f7", "#00e5ff", "#ffcf58", "#35cba2", "#ff5577"][row]
      });
    }
  }

  brickScoreDisplay.textContent = "0";
  drawBrick();
}

function drawBrick() {
  brickCtx.fillStyle = "#0c1220";
  brickCtx.fillRect(0, 0, BW, BH);

  brickBlocks.forEach(block => {
    if (!block.active) return;

    brickCtx.fillStyle = block.color;
    brickCtx.fillRect(block.x, block.y, block.width, block.height);
  });

  brickCtx.fillStyle = "#00e5ff";
  brickCtx.shadowColor = "#00e5ff";
  brickCtx.shadowBlur = 10;
  brickCtx.fillRect(
    brickPaddle.x,
    brickPaddle.y,
    brickPaddle.width,
    brickPaddle.height
  );

  brickCtx.fillStyle = "#ffcf58";
  brickCtx.shadowColor = "#ffcf58";
  brickCtx.shadowBlur = 12;
  brickCtx.beginPath();
  brickCtx.arc(brickBall.x, brickBall.y, brickBall.radius, 0, Math.PI * 2);
  brickCtx.fill();

  brickCtx.shadowBlur = 0;
}

function saveBrickResult() {
  if (brickScore > brickBest) {
    brickBest = brickScore;
    localStorage.setItem("pa-brick-best", brickBest);
    brickBestDisplay.textContent = brickBest;
  }

  const results = JSON.parse(localStorage.getItem("pa-results") || "{}");
  const previous = results.brick || { best: 0, plays: 0 };

  results.brick = {
    best: Math.max(previous.best, brickScore),
    plays: previous.plays + 1
  };

  localStorage.setItem("pa-results", JSON.stringify(results));
}

function endBrick(won) {
  brickRunning = false;
  cancelAnimationFrame(brickAnimation);
  saveBrickResult();

  brickMessage.textContent = won
    ? "YOU WIN! ALL BRICKS DESTROYED!"
    : "GAME OVER — SCORE: " + brickScore;
}

function updateBrick(timestamp) {
  if (!brickRunning) return;

  if (!brickLastTime) brickLastTime = timestamp;
  const dt = Math.min((timestamp - brickLastTime) / 1000, 0.03);
  brickLastTime = timestamp;

  if (brickKeys.ArrowLeft || brickKeys.a) {
    brickPaddle.x -= brickPaddle.speed * dt;
  }

  if (brickKeys.ArrowRight || brickKeys.d) {
    brickPaddle.x += brickPaddle.speed * dt;
  }

  brickPaddle.x = Math.max(
    0,
    Math.min(BW - brickPaddle.width, brickPaddle.x)
  );

  const previousY = brickBall.y;

  brickBall.x += brickBall.vx * dt;
  brickBall.y += brickBall.vy * dt;

  if (brickBall.x - brickBall.radius <= 0) {
    brickBall.x = brickBall.radius;
    brickBall.vx = Math.abs(brickBall.vx);
  }

  if (brickBall.x + brickBall.radius >= BW) {
    brickBall.x = BW - brickBall.radius;
    brickBall.vx = -Math.abs(brickBall.vx);
  }

  if (brickBall.y - brickBall.radius <= 0) {
    brickBall.y = brickBall.radius;
    brickBall.vy = Math.abs(brickBall.vy);
  }

  if (
    brickBall.vy > 0 &&
    previousY + brickBall.radius <= brickPaddle.y &&
    brickBall.y + brickBall.radius >= brickPaddle.y &&
    brickBall.x >= brickPaddle.x - brickBall.radius &&
    brickBall.x <= brickPaddle.x + brickPaddle.width + brickBall.radius
  ) {
    brickBall.y = brickPaddle.y - brickBall.radius;
    brickBall.vy = -Math.abs(brickBall.vy);

    const hit = (
      brickBall.x - (brickPaddle.x + brickPaddle.width / 2)
    ) / (brickPaddle.width / 2);

    brickBall.vx = hit * 230;
  }

  for (const block of brickBlocks) {
    if (!block.active) continue;

    if (
      brickBall.x + brickBall.radius > block.x &&
      brickBall.x - brickBall.radius < block.x + block.width &&
      brickBall.y + brickBall.radius > block.y &&
      brickBall.y - brickBall.radius < block.y + block.height
    ) {
      block.active = false;
      brickBall.vy *= -1;
      brickScore += 10;
      brickScoreDisplay.textContent = brickScore;

      if (brickScore > brickBest) {
        brickBest = brickScore;
        brickBestDisplay.textContent = brickBest;
        localStorage.setItem("pa-brick-best", brickBest);
      }

      break;
    }
  }

  if (brickBlocks.every(block => !block.active)) {
    drawBrick();
    endBrick(true);
    return;
  }

  if (brickBall.y - brickBall.radius > BH) {
    drawBrick();
    endBrick(false);
    return;
  }

  drawBrick();
  brickAnimation = requestAnimationFrame(updateBrick);
}

function startBrick() {
  resetBrick();
  brickRunning = true;
  brickMessage.textContent = "BREAK THEM ALL!";
  brickAnimation = requestAnimationFrame(updateBrick);
}

function openBrick() {
  brickOverlay.hidden = false;
  resetBrick();
  brickMessage.textContent = "Press START to play";
}

function closeBrick() {
  brickOverlay.hidden = true;
  brickRunning = false;
  cancelAnimationFrame(brickAnimation);
  brickKeys = {};
}

document.querySelectorAll('[data-game="brick"]').forEach(button => {
  button.addEventListener("click", openBrick);
});

document.getElementById("close-brick").addEventListener("click", closeBrick);
document.getElementById("brick-start").addEventListener("click", startBrick);
document.getElementById("brick-restart").addEventListener("click", startBrick);

brickOverlay.addEventListener("click", event => {
  if (event.target === brickOverlay) closeBrick();
});

brickCanvas.addEventListener("pointermove", event => {
  if (brickOverlay.hidden) return;

  const rect = brickCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (BW / rect.width);

  brickPaddle.x = Math.max(
    0,
    Math.min(BW - brickPaddle.width, x - brickPaddle.width / 2)
  );

  if (!brickRunning) drawBrick();
});

document.addEventListener("keydown", event => {
  if (brickOverlay.hidden) return;

  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  if (["ArrowLeft", "ArrowRight", "a", "d"].includes(key)) {
    event.preventDefault();
    brickKeys[key] = true;
  }

  if (key === "Escape") closeBrick();
});

document.addEventListener("keyup", event => {
  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  brickKeys[key] = false;
});

resetBrick();