let sentences = {};
let currentEpisode = "";
let currentLine = "";
let currentCharacter = "";
let score = 0;
const highScoreKey = "avatar-line-high-score";

let allQuotes = []; // Flat array of { episode, line }
let unusedQuotes = [];

const sentenceContainer = document.getElementById("sentence-container");
const input = document.getElementById("guess-input");
const characterInput = document.getElementById("character-input");
const guessButton = document.getElementById("guess-button");
const tryAgainButton = document.getElementById("try-again-button");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const feedback = document.getElementById("feedback");
const datalist = document.getElementById("episode-names");
const hardModeCheckbox = document.getElementById("hard-mode-checkbox");
const characterGuessDiv = document.getElementById("character-guess-div");
const characterDatalist = document.getElementById("character-names");

function populateEpisodeList() {
  for (let episode in sentences) {
    let option = document.createElement("option");
    option.value = episode;
    datalist.appendChild(option);
  }
}

function extractCharactersFromQuotes() {
  const characterSet = new Set();

  for (let episode in sentences) {
    sentences[episode].forEach((line) => {
      let parts = line.split(":");
      if (parts.length >= 2) {
        characterSet.add(parts[0].trim());
      }
    });
  }

  characterDatalist.innerHTML = "";
  characterSet.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    characterDatalist.appendChild(option);
  });
}

function buildQuotePool() {
  allQuotes = [];
  for (let episode in sentences) {
    sentences[episode].forEach((line) => {
      allQuotes.push({ episode, line });
    });
  }

  unusedQuotes = [...allQuotes];
}

function showRandomSentence() {
  if (unusedQuotes.length === 0) {
    unusedQuotes = [...allQuotes];
  }

  const randomIndex = Math.floor(Math.random() * unusedQuotes.length);
  const { episode, line } = unusedQuotes.splice(randomIndex, 1)[0];

  currentEpisode = episode;

  if (hardModeCheckbox.checked) {
    let parts = line.split(":");
    if (parts.length >= 2) {
      currentCharacter = parts[0].trim();
      currentLine = parts.slice(1).join(":").trim();
      sentenceContainer.innerText = `"${currentLine}"`;
      characterGuessDiv.style.display = "block";
    } else {
      currentCharacter = "Unknown";
      currentLine = line;
      sentenceContainer.innerText = `"${currentLine}"`;
    }
  } else {
    currentLine = line;
    sentenceContainer.innerText = `"${line}"`;
    characterGuessDiv.style.display = "none";
  }

  input.value = "";
  characterInput.value = "";
  input.style.display = "block";
  guessButton.style.display = "block";
  tryAgainButton.style.display = "none";
  feedback.innerText = "";
}

function checkGuess() {
  const episodeGuess = input.value.trim();
  const charGuess = characterInput.value.trim();

  if (!sentences.hasOwnProperty(episodeGuess)) {
    alert("Please choose an episode from the list.");
    return;
  }

  if (hardModeCheckbox.checked) {
    const charCorrect = charGuess.toLowerCase() === currentCharacter.toLowerCase();
    const epCorrect = episodeGuess === currentEpisode;

    if (epCorrect && charCorrect) {
      score++;
      feedback.innerText = "";
      showRandomSentence();
    } else {
      input.style.display = "none";
      guessButton.style.display = "none";
      tryAgainButton.style.display = "inline-block";
      characterGuessDiv.style.display = "none";
      feedback.innerText = `Wrong! It was "${currentCharacter}" in ${currentEpisode}`;
    }
  } else {
    if (episodeGuess === currentEpisode) {
      score++;
      feedback.innerText = "";
      showRandomSentence();
    } else {
      input.style.display = "none";
      guessButton.style.display = "none";
      tryAgainButton.style.display = "inline-block";
      feedback.innerText = `Wrong! The correct answer was: ${currentEpisode}`;
    }
  }

  updateScore();
}

function updateScore() {
  scoreDisplay.innerText = `Score: ${score}`;
  let highScore = Number(localStorage.getItem(highScoreKey)) || 0;
  if (score > highScore) {
    localStorage.setItem(highScoreKey, score);
    highScoreDisplay.innerText = `High Score: ${score}`;
  } else {
    highScoreDisplay.innerText = `High Score: ${highScore}`;
  }
  updateProgressBar();
}

function updateProgressBar() {
  const progressBar = document.querySelector(".progressToHighScore");
  let highScore = Number(localStorage.getItem(highScoreKey)) || 1;
  let percentage = Math.min((score / highScore) * 100, 100);
  progressBar.style.width = `${percentage}%`;
}

function resetGame() {
  score = 0;
  showRandomSentence();
  scoreDisplay.innerText = `Score: ${score}`;
  updateProgressBar();
}

guessButton.addEventListener("click", checkGuess);
tryAgainButton.addEventListener("click", resetGame);
input.addEventListener("keypress", (e) => { if (e.key === "Enter") checkGuess(); });
characterInput.addEventListener("keypress", (e) => { if (e.key === "Enter") checkGuess(); });
hardModeCheckbox.addEventListener("change", () => {
  resetGame();
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("avatar_quotes.json")
    .then((response) => response.json())
    .then((data) => {
      sentences = data;
      populateEpisodeList();
      extractCharactersFromQuotes();
      buildQuotePool();
      showRandomSentence();
      updateScore();
    })
    .catch((error) => {
      console.error("Failed to load JSON:", error);
      sentenceContainer.innerText = "Error loading data!";
    });
});
