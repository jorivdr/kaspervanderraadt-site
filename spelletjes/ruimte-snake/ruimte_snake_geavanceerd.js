document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const gridSize = 20;
  const cols = canvas.width / gridSize;
  const rows = canvas.height / gridSize;
  let snake = [{ x: 5, y: 5 }];
  let direction = 'right';
  let nextDirection = 'right';
  let food = {};
  let score = 0;
  let level = 1;
  let shield = 0;
  let speed = 100;
  let interval;
  let gameOver = false;
  let achievements = new Set();
  let obstacles = [];

  const messages = {
    start: "Gebruik pijltjes of WASD. Verzamel energiecellen 🚀",
    shield: "Schild actief! Je bent tijdelijk onkwetsbaar.",
    levelUp: "Nieuw level! Alles wordt sneller... 😅",
    gameOver: ["Kaboom! ☄️ Probeer het nog eens.", "Je hebt jezelf opgegeten... 😬"]
  };

  function randomGridPosition() {
    return {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
  }

  function placeFood() {
    const types = ['normaal', 'snel', 'traag', 'schild'];
    food = { ...randomGridPosition(), type: types[Math.floor(Math.random() * types.length)] };
  }

  function drawFood() {
    ctx.fillStyle = {
      normaal: 'lime',
      snel: 'red',
      traag: 'blue',
      schild: 'gold'
    }[food.type];
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  }

  function drawSnake() {
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? 'white' : (shield > 0 ? 'yellow' : 'purple');
      ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize, gridSize);
    });
  }

  function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(o => {
      ctx.beginPath();
      ctx.arc(o.x * gridSize + 10, o.y * gridSize + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function moveSnake() {
    const head = { ...snake[0] };
    direction = nextDirection;
    switch (direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += (food.type === 'normaal') ? 10 : 0;
      if (food.type === 'snel') speed = Math.max(40, speed - 10);
      if (food.type === 'traag') speed += 20;
      if (food.type === 'schild') shield = 30;
      placeFood();
      checkAchievements();
    } else {
      snake.pop();
    }
  }

  function checkCollision() {
    const [head, ...body] = snake;
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) return true;
    if (body.some(seg => seg.x === head.x && seg.y === head.y)) return true;
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) return shield <= 0;
    return false;
  }

  function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();

    if (checkCollision()) {
      return endGame();
    }

    drawSnake();
    drawFood();
    drawObstacles();
    updateUI();

    if (shield > 0) shield--;
    if (score >= level * 100) levelUp();
  }

  function levelUp() {
    level++;
    speed = Math.max(30, speed - 10);
    addObstacle();
    showMessage(messages.levelUp);
    clearInterval(interval);
    interval = setInterval(updateGame, speed);
  }

  function addObstacle() {
    obstacles.push(randomGridPosition());
  }

  function showMessage(msg) {
    document.getElementById('message').textContent = msg;
    setTimeout(() => document.getElementById('message').textContent = '', 3000);
  }

  function updateUI() {
    document.getElementById('scoreDisplay').textContent = `Score: ${score} | Level: ${level}`;
  }

  function checkAchievements() {
    if (score >= 50 && !achievements.has('starter')) {
      achievements.add('starter');
      showMessage('🎉 Prestatie: Eerste 50 punten!');
    }
    if (score >= 200 && !achievements.has('veteraan')) {
      achievements.add('veteraan');
      showMessage('🏆 Prestatie: 200 punten behaald!');
    }
  }

  function endGame() {
    gameOver = true;
    clearInterval(interval);
    const msg = messages.gameOver[Math.floor(Math.random() * messages.gameOver.length)];
    showMessage(msg);
    saveHighscore();
    setTimeout(() => location.reload(), 3000);
  }

  function saveHighscore() {
    let highscores = JSON.parse(localStorage.getItem('ruimte_snake_scores') || '[]');
    highscores.push({ score, date: new Date().toISOString() });
    highscores = highscores.sort((a, b) => b.score - a.score).slice(0, 5);
    localStorage.setItem('ruimte_snake_scores', JSON.stringify(highscores));
    renderHighscores(highscores);
  }

  function renderHighscores(list = null) {
    const hs = list || JSON.parse(localStorage.getItem('ruimte_snake_scores') || '[]');
    const el = document.getElementById('highscoreList');
    el.innerHTML = '';
    hs.forEach(h => {
      const li = document.createElement('li');
      li.textContent = `${h.score} punten (${new Date(h.date).toLocaleDateString()})`;
      el.appendChild(li);
    });
  }

  document.addEventListener('keydown', e => {
    const map = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right'
    };
    const newDir = map[e.key];
    if (!newDir) return;
    if ((direction === 'up' && newDir !== 'down') ||
        (direction === 'down' && newDir !== 'up') ||
        (direction === 'left' && newDir !== 'right') ||
        (direction === 'right' && newDir !== 'left')) {
      nextDirection = newDir;
    }
  });

  placeFood();
  renderHighscores();
  showMessage(messages.start);
  interval = setInterval(updateGame, speed);
});
