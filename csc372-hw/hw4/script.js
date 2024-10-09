const playerOptionsImgs = document.getElementById("player-options").querySelectorAll("img");
const imgUrls = [];
imgUrls.push("rock.png");
imgUrls.push("paper.png");
imgUrls.push("scissors.png");
const playOptions = [];
playOptions.push("rock");
playOptions.push("paper");
playOptions.push("scissors");
var opponentIndex = 0;

const betterThan = {};
betterThan["rock"] = "paper";
betterThan["paper"] = "scissors";
betterThan["scissors"] = "rock";

var playerChoice = "";
var opponentChoice = "";
var isGameRunning = false;
var isGameOver = false;

const opponentImg = document.getElementById("opponent-choice");
const opponentLabel = document.getElementById("opponent-label");

var playerScore = 0;
var opponentScore = 0;
const playerScoreLabel = document.getElementById("player-score");
const opponentScoreLabel = document.getElementById("opponent-score");

const nextGameButton = document.getElementById("next-game-button");
const resetScoresButton = document.getElementById("reset-scores-button");

function selectPlayerChoice(playerSelectedImg) {

    // Ignore inputs to avoid confusion while score is updated
    if (isGameOver) {
        return;
    }
    
    // Deselect all images in the row
    playerOptionsImgs.forEach(img => img.classList.remove('selected'));

    // Mark the user's choice as selected
    playerSelectedImg.classList.add('selected');
    playerChoice = playerSelectedImg.id;
}

function startGame() {

    if (isGameRunning) {
        return;
    }
    isGameRunning = true;

    // Auto-select paper if the user hasn't clicked a choice yet
    if (playerChoice === "") {
        selectPlayerChoice(document.getElementById("paper"));
    }

    resetScoresButton.disabled = true;
    
    // Disable hover
    opponentImg.classList.remove("opponent-img");
    
    opponentLabel.textContent = "Thinking...";

    // Start with a random offset and begin the roll
    opponentIndex = Math.floor(Math.random() * 3);
    var clock = setInterval(() => {
        opponentIndex = (opponentIndex + 1) % imgUrls.length;
        opponentImg.src = imgUrls[opponentIndex];
        opponentChoice = playOptions[opponentIndex];
    }, 300);
    
    // Determine winner after 5 seconds
    setTimeout(() => endGame(clock), 5000);
}

function endGame(clock) {

    // Stop the roll
    clearInterval(clock);
    isGameOver = true;

    // Show computer's choice as selected
    opponentImg.classList.add("selected");

    // Capitalize text for display
    const pc = playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1);
    const oc = opponentChoice.charAt(0).toUpperCase() + opponentChoice.slice(1);

    if (betterThan[opponentChoice] === playerChoice) { // Player won?
        opponentLabel.textContent = pc + " beats " + oc + "... You won :)";
        playerScore += 1;
        playerScoreLabel.textContent = "Player score: " + playerScore;
    } else if (betterThan[playerChoice] === opponentChoice) { // Computer won?
        opponentLabel.textContent = oc + " beats " + pc + "... You lost :(";
        opponentScore += 1;
        opponentScoreLabel.textContent = "Computer score: " + opponentScore;
    } else { // Draw
        opponentLabel.textContent = "Draw :/";
    }
    
    // Enable the buttons
    nextGameButton.disabled = false;
    resetScoresButton.disabled = playerScore == 0 && opponentScore == 0;
}

function resetForNextGame() {

    isGameOver = false;
    isGameRunning = false;

    // Re-enable hover
    opponentImg.classList.add("opponent-img");
    opponentImg.classList.remove("selected");
    opponentImg.src = "question-mark.png";

    opponentLabel.textContent = "Click to roll computer's hand";
    opponentLabel.disabled = false;

    nextGameButton.disabled = true;
}

function resetScores() {

    playerScore = 0;
    opponentScore = 0;

    playerScoreLabel.textContent = "Player score:";
    opponentScoreLabel.textContent = "Computer score:";

    resetScoresButton.disabled = true;
}
