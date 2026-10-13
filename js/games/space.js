const spaceCanvas = document.getElementById("space-canvas");
const spaceCtx = spaceCanvas.getContext("2d");

const spaceOverlay = document.getElementById("space-overlay");
const spaceScoreDisplay = document.getElementById("space-score");
const spaceBestDisplay = document.getElementById("space-best");
const spaceMessage = document.getElementById("space-message");

const SW = spaceCanvas.width;
const SH = spaceCanvas.height;

let spacePlayer;
let spaceBullets = [];
let spaceEnemies = [];
let spaceStars = [];
let spaceKeys = {};

let spaceScore = 0;
let spaceBest = Number(localStorage.getItem("pa-space-best") || 0);
let spaceRunning = false;
let spaceFrame = 0;
let spaceAnimation = null;
let spaceLastShot = 0;

spaceBestDisplay.textContent = spaceBest;

function resetSpace() {
  cancelAnimationFrame(spaceAnimation);

  spaceRunning = false;
  spaceFrame = 0;
  spaceScore = 0;
  spaceBullets = [];
  spaceEnemies = [];
  spaceKeys = {};
  spaceLastShot = 0;

  spacePlayer = {
    x: SW / 2 - 18,
    y: SH - 45,
    width: 36,
    height: 24,
    speed: 5
  };

  spaceStars = Array.from({ length: 45 }, () => ({
    x: Math.random() * SW,
    y: Math.random() * SH,
    size: Math.random() * 2 + 0.5
  }));

  spaceScoreDisplay.textContent = "0";
  drawSpace();
}

function drawSpace() {
  spaceCtx.fillStyle = "#080d1d";
  spaceCtx.fillRect(0, 0, SW, SH);

  spaceCtx.fillStyle = "#ffffff80";

  spaceStars.forEach(star => {
    spaceCtx.fillRect(star.x, star.y, star.size, star.size);
  });

  spaceCtx.fillStyle = "#00e5ff";
  spaceCtx.shadowColor = "#00e5ff";
  spaceCtx.shadowBlur = 14;

  spaceCtx.beginPath();
  spaceCtx.moveTo(spacePlayer.x + spacePlayer.width / 2, spacePlayer.y);
  spaceCtx.lineTo(spacePlayer.x + spacePlayer.width, spacePlayer.y + spacePlayer.height);
  spaceCtx.lineTo(spacePlayer.x, spacePlayer.y + spacePlayer.height);
  spaceCtx.closePath();
  spaceCtx.fill();

  spaceCtx.shadowBlur = 0;

  // Lasers
  spaceCtx.fillStyle = "#ffcf58";

  spaceBullets.forEach(bullet => {
    spaceCtx.fillRect(bullet.x, bullet.y, 4, 12);
  });

  spaceEnemies.forEach(enemy => {
    spaceCtx.fillStyle = "#ff5577";
    spaceCtx.shadowColor = "#ff5577";
    spaceCtx.shadowBlur = 8;

    spaceCtx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    spaceCtx.fillStyle = "#080d1d";
    spaceCtx.fillRect(enemy.x + 6, enemy.y + 8, 5, 5);
    spaceCtx.fillRect(enemy.x + 19, enemy.y + 8, 5, 5);
  });

  spaceCtx.shadowBlur = 0;
}

function spaceCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endSpace() {
  spaceRunning = false;
  cancelAnimationFrame(spaceAnimation);

  if (spaceScore > spaceBest) {
    spaceBest = spaceScore;
    localStorage.setItem("pa-space-best", spaceBest);
    spaceBestDisplay.textContent = spaceBest;
  }

  const results = JSON.parse(localStorage.getItem("pa-results") || "{}");
  const previous = results.space || { best: 0, plays: 0 };

  results.space = {
    best: Math.max(previous.best, spaceScore),
    plays: previous.plays + 1
  };

  localStorage.setItem("pa-results", JSON.stringify(results));

  spaceMessage.textContent = "GAME OVER — SCORE: " + spaceScore;
}

function updateSpace() {
  if (!spaceRunning) return;

  spaceFrame++;

  if (spaceKeys.ArrowLeft || spaceKeys.a) {
    spacePlayer.x -= spacePlayer.speed;
  }

  if (spaceKeys.ArrowRight || spaceKeys.d) {
    spacePlayer.x += spacePlayer.speed;
  }

  spacePlayer.x = Math.max(
    0,
    Math.min(SW - spacePlayer.width, spacePlayer.x)
  );

  if (spaceKeys[" "] && spaceFrame - spaceLastShot >= 10) {
    spaceBullets.push({
      x: spacePlayer.x + spacePlayer.width / 2 - 2,
      y: spacePlayer.y,
      width: 4,
      height: 12
    });

    spaceLastShot = spaceFrame;
  }

  const spawnRate = Math.max(16, 48 - Math.floor(spaceScore / 50));

  if (spaceFrame % spawnRate === 0) {
    spaceEnemies.push({
      x: Math.random() * (SW - 30),
      y: -30,
      width: 30,
      height: 26,
      speed: 1.5 + Math.min(spaceScore / 100, 3)
    });
  }

  spaceBullets.forEach(bullet => {
    bullet.y -= 7;
  });

  spaceBullets = spaceBullets.filter(bullet => bullet.y > -20);

  spaceEnemies.forEach(enemy => {
    enemy.y += enemy.speed;
  });

  for (let i = spaceEnemies.length - 1; i >= 0; i--) {
    const enemy = spaceEnemies[i];

    for (let j = spaceBullets.length - 1; j >= 0; j--) {
      if (spaceCollision(spaceBullets[j], enemy)) {
        spaceEnemies.splice(i, 1);
        spaceBullets.splice(j, 1);

        spaceScore += 10;
        spaceScoreDisplay.textContent = spaceScore;

        if (spaceScore > spaceBest) {
          spaceBest = spaceScore;
          spaceBestDisplay.textContent = spaceBest;
          localStorage.setItem("pa-space-best", spaceBest);
        }

        break;
      }
    }
  }

  for (const enemy of spaceEnemies) {
    if (
      enemy.y + enemy.height >= SH ||
      spaceCollision(enemy, spacePlayer)
    ) {
      endSpace();
      drawSpace();
      return;
    }
  }

  drawSpace();
  spaceAnimation = requestAnimationFrame(updateSpace);
}

function startSpace() {
  resetSpace();
  spaceRunning = true;
  spaceMessage.textContent = "DEFEND THE GALAXY!";
  spaceAnimation = requestAnimationFrame(updateSpace);
}

function openSpace() {
  spaceOverlay.hidden = false;
  resetSpace();
  spaceMessage.textContent = "Press START to play";
}

function closeSpace() {
  spaceOverlay.hidden = true;
  spaceRunning = false;
  cancelAnimationFrame(spaceAnimation);
  spaceKeys = {};
}

document.querySelectorAll('[data-game="space"]').forEach(button => {
  button.addEventListener("click", openSpace);
});

document.getElementById("close-space").addEventListener("click", closeSpace);
document.getElementById("space-start").addEventListener("click", startSpace);
document.getElementById("space-restart").addEventListener("click", startSpace);

spaceOverlay.addEventListener("click", event => {
  if (event.target === spaceOverlay) closeSpace();
});

document.addEventListener("keydown", event => {
  if (spaceOverlay.hidden) return;

  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  if (["ArrowLeft", "ArrowRight", "a", "d", " "].includes(key)) {
    event.preventDefault();
    spaceKeys[key] = true;
  }

  if (key === "Escape") closeSpace();
});

document.addEventListener("keyup", event => {
  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  spaceKeys[key] = false;
});

resetSpace();