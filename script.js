let sentences = {};
let currentEpisode = "";
let score = 0;
const highScoreKey = "avatar-line-high-score";

const sentenceContainer = document.getElementById("sentence-container");
const input = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const tryAgainButton = document.getElementById("try-again-button");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const feedback = document.getElementById("feedback");
const datalist = document.getElementById("episode-names");

function populateEpisodeList() {
  for (let episode in sentences) {
    let option = document.createElement("option");
    option.value = episode;
    datalist.appendChild(option);
  }
}

function showRandomSentence() {
  let keys = Object.keys(sentences);
  currentEpisode = keys[Math.floor(Math.random() * keys.length)];
  let line = sentences[currentEpisode][Math.floor(Math.random() * sentences[currentEpisode].length)];
  sentenceContainer.innerText = `"${line}"`;
  input.value = "";
  input.style.display = "block";
  guessButton.style.display = "block";
  tryAgainButton.style.display = "none";
  feedback.innerText = "";
}

function checkGuess() {
  let guess = input.value;
  if (sentences.hasOwnProperty(guess)) {
    if (guess === currentEpisode) {
      score++;
      showRandomSentence();
    } else {
      input.style.display = "none";
      guessButton.style.display = "none";
      tryAgainButton.style.display = "inline-block";
      feedback.innerText = `Wrong! The correct answer was: ${currentEpisode}`;
    }
    updateScore();
  } else {
    alert("Please choose an episode from the list.");
  }
}

function updateScore() {
  scoreDisplay.innerText = `Score: ${score}`;
  let highScore = Number(localStorage.getItem(highScoreKey)) || 0;
  if (score > highScore) {
    localStorage.setItem(highScoreKey, score);
    highScoreDisplay.innerText = `High Score: ${score}`;
    highScoreDisplay.style.color = "red";
  } else {
    highScoreDisplay.innerText = `High Score: ${highScore}`;
  }
}

function resetGame() {
  score = 0;
  showRandomSentence();
  scoreDisplay.innerText = `Score: ${score}`;
  highScoreDisplay.style.color = "black";
}

guessButton.addEventListener("click", checkGuess);
tryAgainButton.addEventListener("click", resetGame);
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") checkGuess();
});

// Load external JSON and initialize game
document.addEventListener("DOMContentLoaded", () => {
  fetch("avatar_quotes.json")
    .then((response) => response.json())
    .then((data) => {
      sentences = data;
      populateEpisodeList();
      showRandomSentence();
      updateScore();
    })
    .catch((error) => {
      console.error("Failed to load JSON:", error);
      sentenceContainer.innerText = "Error loading data!";
    });
});
