
// Alleen de endGame functie met Firebase
function endGame() {
  gameOver = true;
  clearInterval(interval);
  const msg = messages.gameOver[Math.floor(Math.random() * messages.gameOver.length)];
  showMessage(msg);

  setTimeout(() => {
    const name = prompt("Game over! Vul je naam in voor het leaderboard:");
    if (name) {
      if (typeof submitSnakeScore === 'function') {
        submitSnakeScore(name, score);
      }
    }
    location.reload();
  }, 1000);
}
