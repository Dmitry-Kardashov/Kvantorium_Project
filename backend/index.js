const express = require('express');
const cors = require('cors'); // Импортируем cors
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Разрешаем все CORS-запросы
app.use(cors());

// Или настройте CORS для конкретных доменов
// app.use(cors({
//     origin: 'http://your-frontend-domain.com', // Разрешить только этот домен
//     methods: ['GET', 'POST'], // Разрешить только определённые методы
//     credentials: true // Разрешить передачу куки и заголовков авторизации
// }));

const server = http.createServer(app);
const io = new Server(server);

// Middleware для обработки JSON
app.use(express.json());

// Хранение данных о комнатах и игроках
let rooms = {};

// REST API для создания комнаты
app.post('/api/rooms', (req, res) => {
    const roomId = generateRoomId();
    rooms[roomId] = {
        players: [],
        gameState: {
            player1: { ships: [], shots: [] },
            player2: { ships: [], shots: [] },
            currentTurn: null,
        },
    };
    res.status(201).json({ roomId });
});

// REST API для получения информации о комнате
app.get('/api/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    if (rooms[roomId]) {
        res.json(rooms[roomId]);
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

// WebSocket подключение
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Подключение к комнате
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);

            // Уведомляем всех игроков в комнате о подключении
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
            }
        }
    });

    // Отключение игрока
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Очистка комнат, если игрок отключился
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(player => player !== socket.id);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
            }
        }
    });
});

// Генерация уникального ID для комнаты
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Запуск сервера
const PORT = 5500;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});