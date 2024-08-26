const socket = io();

let player = null;
let isTurn = false;
let gameOver = false;

const cells = document.querySelectorAll('.cell');
const textarea = document.querySelector("#textarea");
const messageArea = document.querySelector(".message-area");
const button = document.querySelector("#button");

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

let name = null;
do {
    name = prompt("Enter your name");
} while (!name);

button.addEventListener("click", sendMessage);
textarea.addEventListener("keyup", function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        sendMessage();
    }
});

function sendMessage() {
    let msg = {
        user: name,
        message: textarea.value.trim()
    };

    appendMessage(msg, "outgoing");
    textarea.value = "";
    scrollToBottom();
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

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

socket.on('message', function (msg) {
    appendMessage(msg, "incoming");
    scrollToBottom();
});

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (isTurn && !cell.innerText && !gameOver) {
            makeMove(cell);
        }
    });
});

function makeMove(cell) {
    let index = Array.from(cells).indexOf(cell);
    let move = { index: index, player: player };

    cell.innerText = player;

    if (checkWinner(player)) {
        socket.emit('game-over', { winner: player });
        return;
    } else if (checkDraw()) {
        socket.emit('game-over', { winner: 'draw' });
        return;
    }

    socket.emit('play', move);
    isTurn = false;
}

socket.on('play', function (move) {
    cells[move.index].innerText = move.player;

    if (checkWinner(move.player)) {
        socket.emit('game-over', { winner: move.player });
    } else if (checkDraw()) {
        socket.emit('game-over', { winner: 'draw' });
    }

    isTurn = true;
});

socket.on('player-assigned', function (data) {
    player = data.player;
    isTurn = data.isTurn;
    alert(`You are player ${player}.`);
});

socket.on('spectator', function () {
    alert("You are a spectator. You cannot play the game.");
});

socket.on('game-over', function (data) {
    gameOver = true;
    if (data.winner === 'draw') {
        alert("It's a draw!");
    } else {
        alert(`${data.winner} wins the game!`);
    }

    resetBoard();
});

function checkWinner(currentPlayer) {
    return winConditions.some(combination => {
        return combination.every(index => {
            return cells[index].innerText === currentPlayer;
        });
    });
}

function checkDraw() {
    return Array.from(cells).every(cell => {
        return cell.innerText !== '';
    });
}

function resetBoard() {
    setTimeout(() => {
        cells.forEach(cell => {
            cell.innerText = '';
        });
        gameOver = false;
        isTurn = (player === 'X'); // 'X' starts the next game
    }, 2000);
}
