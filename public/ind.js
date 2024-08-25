const socket = io();

// Variables for player and turn state
let player = null;
let isTurn = false;

// Elements from the DOM
const textarea = document.querySelector("#textarea");
const messageArea = document.querySelector(".message-area");
const button = document.querySelector("#button");
const cells = document.querySelectorAll('.cell');
const board = document.querySelector('.board');

// Player name prompt
let name = null;
do {
    name = prompt("Enter your name");
} while (!name);

// Handle chat
button.addEventListener("click", sendMessage);
textarea.addEventListener("keyup", function (event) {
    if ((event.key === 'Enter') && (!event.shiftKey)) {
        sendMessage();
    }
});

function sendMessage() {
    let msg = {
        user: name,
        message: textarea.value.trim()
    };

    // Append the message to the chat area
    appendMessage(msg, "outgoing");
    textarea.value = "";
    scrollToBottom();

    // Send message to the server
    socket.emit("message", msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, "message");

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

// Scroll to bottom of the chat area
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Receive chat messages from server
socket.on('message', function (msg) {
    appendMessage(msg, "incoming");
    scrollToBottom();
});

// Tic-Tac-Toe Logic
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (isTurn && !cell.innerText) { // Check if it's the player's turn and the cell is empty
            makeMove(cell);
        }
    });
});

function makeMove(cell) {
    let index = Array.from(cells).indexOf(cell);
    let move = { index: index, player: player };

    // Update the board locally
    cell.innerText = player;

    // Emit the move to the server
    socket.emit('play', move);

    // Disable further moves until the next turn
    isTurn = false;
}

// Handle moves from the other player
socket.on('play', function (move) {
    cells[move.index].innerText = move.player;
    isTurn = true; // It's your turn after the other player has moved
});

// Handle player assignment
socket.on('player-assigned', function (data) {
    player = data.player;
    isTurn = data.isTurn;

    alert(`You are player ${player}.`);
});

// Handle spectators
socket.on('spectator', function () {
    alert("You are a spectator. You cannot play the game.");
});

// Handle turn updates
socket.on('turn', function (data) {
    isTurn = data.isTurn;
});

// Handle game over
socket.on('game-over', function () {
    alert("Game over!");
    resetBoard();
});

// Handle game restart
socket.on('restart', function () {
    resetBoard();
});

// Reset the game board
function resetBoard() {
    cells.forEach(cell => {
        cell.innerText = '';
    });
    isTurn = (player === 'X'); // Reset turn to 'X' to start
}
