document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const gridSize = 20;
  let snake = [{ x: 160, y: 160 }];
  let direction = 'right';
  let food = { x: 320, y: 320 };
  let score = 0;

  function drawSnake() {
    ctx.fillStyle = 'lime';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, gridSize, gridSize));
  }

  function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
  }

  function moveSnake() {
    const head = { ...snake[0] };
    switch (direction) {
      case 'up': head.y -= gridSize; break;
      case 'down': head.y += gridSize; break;
      case 'left': head.x -= gridSize; break;
      case 'right': head.x += gridSize; break;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function placeFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
  }

  function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
      return true;
    }
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    return false;
  }

  function gameLoop() {
    if (checkCollision()) {
      alert('Game Over! Score: ' + score);
      snake = [{ x: 160, y: 160 }];
      direction = 'right';
      score = 0;
      placeFood();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    drawFood();
    setTimeout(gameLoop, 100);
  }

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
      case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
      case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
      case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
    }
  });

  placeFood();
  gameLoop();
});
