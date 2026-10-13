const results = JSON.parse(localStorage.getItem("pa-results") || "{}");

const games = ["space", "snake", "brick"];

const gameData = {};

games.forEach(game => {
  const saved = results[game] || {};

  const separateBest = Number(
    localStorage.getItem(`pa-${game}-best`) || 0
  );

  gameData[game] = {
    best: Math.max(Number(saved.best || 0), separateBest),
    plays: Number(saved.plays || 0)
  };

  document.getElementById(`record-${game}`).textContent =
    gameData[game].best;

  const plays = gameData[game].plays;

  document.getElementById(`plays-${game}`).textContent =
    `${plays} ${plays === 1 ? "game" : "games"} played`;
});

const totalPlays = games.reduce(
  (total, game) => total + gameData[game].plays,
  0
);

const totalScore = games.reduce(
  (total, game) => total + gameData[game].best,
  0
);

document.getElementById("total-plays").textContent = totalPlays;
document.getElementById("total-score").textContent = totalScore;

const achievements = [
  {
    icon: "🎮",
    name: "FIRST STEPS",
    description: "Finish your first arcade game.",
    unlocked: totalPlays >= 1
  },
  {
    icon: "👾",
    name: "SPACE CADET",
    description: "Score at least 50 points in Space Defender.",
    unlocked: gameData.space.best >= 50
  },
  {
    icon: "🐍",
    name: "SNAKE CHARMER",
    description: "Score at least 50 points in Neon Snake.",
    unlocked: gameData.snake.best >= 50
  },
  {
    icon: "🧱",
    name: "BRICK BUSTER",
    description: "Score at least 100 points in Brick Breaker.",
    unlocked: gameData.brick.best >= 100
  },
  {
    icon: "🕹️",
    name: "ARCADE EXPLORER",
    description: "Finish at least one round of every game.",
    unlocked: games.every(game => gameData[game].plays >= 1)
  },
  {
    icon: "🏆",
    name: "ARCADE LEGEND",
    description: "Play 15 games and earn 500 combined best-score points.",
    unlocked: totalPlays >= 15 && totalScore >= 500
  }
];

const grid = document.getElementById("achievements-grid");

achievements.forEach(achievement => {
  const card = document.createElement("article");

  card.className = `achievement-card ${
    achievement.unlocked ? "" : "locked"
  }`;

  card.innerHTML = `
    <span class="achievement-icon">
      ${achievement.unlocked ? achievement.icon : "🔒"}
    </span>

    <h3>${achievement.name}</h3>
    <p>${achievement.description}</p>

    <span class="achievement-status">
      ${achievement.unlocked ? "✓ UNLOCKED" : "LOCKED"}
    </span>
  `;

  grid.appendChild(card);
});

const unlockedCount = achievements.filter(
  achievement => achievement.unlocked
).length;

document.getElementById("total-trophies").textContent =
  `${unlockedCount}/${achievements.length}`;