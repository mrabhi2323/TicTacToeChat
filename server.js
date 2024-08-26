const express = require("express");
const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

let players = [];
let playerTurn = 0;

io.on('connection', function (socket) {
    console.log("connected");

    if (players.length < 2) {
        let player = players.length === 0 ? 'X' : 'O';
        players.push({ id: socket.id, player: player });
        socket.emit('player-assigned', { player: player, isTurn: playerTurn === 0 });

        if (players.length === 2) {
            io.to(players[0].id).emit('player-assigned', { player: 'X', isTurn: true });
            io.to(players[1].id).emit('player-assigned', { player: 'O', isTurn: false });
        }
    } else {
        socket.emit('spectator');
    }

    socket.on("message", function (msg) {
        socket.broadcast.emit("message", msg);
    });

    socket.on("play", function (move) {
        socket.broadcast.emit("play", move); // Broadcast the move to other clients
    });

    socket.on("game-over", function (data) {
        io.emit("game-over", data); // Emit game-over to all clients
    });

    socket.on('disconnect', function () {
        players = players.filter(player => player.id !== socket.id);
        playerTurn = 0;
        io.emit('reset');
    });
});

http.listen(process.env.PORT || 3001, function () {
    console.log("server started on 3001");
});
