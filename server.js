const express = require("express");
const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

let players = {};
let currentPlayer = 'X';

io.on('connection', function (socket) {
    console.log("A player connected:", socket.id);

    // Assign player 'X' or 'O'
    if (!players['X']) {
        players['X'] = socket.id;
        socket.emit('player-assigned', { player: 'X', isTurn: true });
    } else if (!players['O']) {
        players['O'] = socket.id;
        socket.emit('player-assigned', { player: 'O', isTurn: false });
    } else {
        socket.emit('spectator');  // If there are already two players, the user becomes a spectator
    }

    // Handle incoming messages for chat
    socket.on("message", function (msg) {
        socket.broadcast.emit("message", msg);
    });

    // Handle player move
    socket.on("play", function (data) {
        if (socket.id === players[currentPlayer]) {
            socket.broadcast.emit("play", data); // Broadcast the move to the other player

            // Toggle current player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            // Notify both players of whose turn it is
            io.to(players['X']).emit('turn', { isTurn: currentPlayer === 'X' });
            io.to(players['O']).emit('turn', { isTurn: currentPlayer === 'O' });
        }
    });

    // Handle game over
    socket.on('game-over', function () {
        io.emit('game-over'); // Notify all players that the game is over
        currentPlayer = 'X'; // Reset the current player to 'X'
    });

    // Handle game restart
    socket.on('restart', function () {
        io.emit('restart'); // Broadcast to restart the game
        currentPlayer = 'X'; // Reset to 'X' for a new game
    });

    // Handle player disconnect
    socket.on('disconnect', function () {
        console.log("A player disconnected:", socket.id);

        // Remove player from the players list
        if (players['X'] === socket.id) {
            players['X'] = null;
        } else if (players['O'] === socket.id) {
            players['O'] = null;
        }

        // Reset the game when a player disconnects
        io.emit('player-disconnected');
        currentPlayer = 'X';
    });
});

http.listen(process.env.PORT || 3001, function () {
    console.log("server started on 3001");
});
