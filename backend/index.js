const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Хранение данных о комнатах
let rooms = {};

// Генерация случайного ID комнаты
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Логика для ИИ
class AI {
    constructor() {
        this.shots = []; // Ходы ИИ
        this.ships = []; // Корабли ИИ
    }

    // Случайный выстрел
    makeRandomShot() {
        let x, y;
        do {
            x = Math.floor(Math.random() * 10); // Случайная координата X (0-9)
            y = Math.floor(Math.random() * 10); // Случайная координата Y (0-9)
        } while (this.shots.some(shot => shot.x === x && shot.y === y)); // Проверяем, чтобы выстрел не повторялся
        this.shots.push({ x, y });
        return { x, y };
    }

    // Метод для расстановки кораблей
    placeShips() {
        const shipLengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Длины кораблей
        this.ships = []; // Очищаем массив кораблей перед расстановкой

        shipLengths.forEach(length => {
            let ship;
            do {
                ship = this.generateShip(length);
            } while (this.isShipOverlapping(ship)); // Проверяем, чтобы корабли не пересекались
            this.ships.push(ship);
        });
    }

    // Генерация корабля заданной длины
    generateShip(length) {
        const isVertical = Math.random() < 0.5; // Случайно выбираем ориентацию корабля (вертикальная или горизонтальная)
        const x = Math.floor(Math.random() * (10 - (isVertical ? 0 : length))); // Случайная координата X
        const y = Math.floor(Math.random() * (10 - (isVertical ? length : 0))); // Случайная координата Y

        const ship = [];
        for (let i = 0; i < length; i++) {
            if (isVertical) {
                ship.push({ x, y: y + i });
            } else {
                ship.push({ x: x + i, y });
            }
        }
        return ship;
    }

    // Проверка на пересечение кораблей
    isShipOverlapping(newShip) {
        for (const ship of this.ships) {
            for (const cell of ship) {
                for (const newCell of newShip) {
                    if (newCell.x === cell.x && newCell.y === cell.y) {
                        return true; // Корабли пересекаются
                    }
                }
            }
        }
        return false; // Корабли не пересекаются
    }
}

// REST API для создания комнаты
app.post('/api/rooms', (req, res) => {
    const roomId = generateRoomId();
    const isSinglePlayer = req.body.singlePlayer || false; // Проверяем, одиночная ли это игра

    rooms[roomId] = {
        players: [],
        gameState: {
            player1: { ships: [], shots: [] },
            player2: { ships: [], shots: [] },
            currentTurn: null,
        },
        ai: isSinglePlayer ? new AI() : null, // Добавляем ИИ, если это одиночная игра
    };

    res.status(201).json({ roomId });
});

// WebSocket подключение
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Подключение к комнате
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);

            // Если это одиночная игра, добавляем ИИ как второго игрока
            if (rooms[roomId].ai && rooms[roomId].players.length === 1) {
                rooms[roomId].players.push('AI'); // ИИ становится вторым игроком
            }

            io.to(roomId).emit('playerJoined', rooms[roomId].players);

            // Если комната заполнена, начинаем игру
            if (rooms[roomId].players.length === 2) {
                rooms[roomId].gameState.currentTurn = rooms[roomId].players[0];
                io.to(roomId).emit('gameStart', rooms[roomId].gameState);
            }
        } else {
            socket.emit('roomFull');
        }
    });

    // Обработка хода игрока
    socket.on('makeMove', (roomId, move) => {
        if (rooms[roomId]) {
            const { player, target } = move;
            const gameState = rooms[roomId].gameState;

            // Проверяем, чей сейчас ход
            if (gameState.currentTurn === player) {
                // Обновляем состояние игры
                const opponent = gameState.currentTurn === rooms[roomId].players[0] ? rooms[roomId].players[1] : rooms[roomId].players[0];
                gameState[opponent].shots.push(target);

                // Меняем ход на другого игрока
                gameState.currentTurn = opponent;

                // Отправляем обновленное состояние всем игрокам в комнате
                io.to(roomId).emit('gameStateUpdated', gameState);

                // Если это одиночная игра, ИИ делает ход
                if (rooms[roomId].ai && opponent === 'AI') {
                    setTimeout(() => {
                        const aiMove = rooms[roomId].ai.makeRandomShot();
                        gameState.player1.shots.push(aiMove);
                        gameState.currentTurn = rooms[roomId].players[0]; // Возвращаем ход игроку
                        io.to(roomId).emit('gameStateUpdated', gameState);
                    }, 1000); // ИИ делает ход через 1 секунду
                }
            }
        }
    });

    // Отключение игрока
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(player => player !== socket.id);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
            }
        }
    });
});

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});