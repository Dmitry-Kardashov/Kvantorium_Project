const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Хранилище активных игр
const games = new Map();

class Game {
  constructor(playerShips) {
    this.id = uuidv4();
    
    // Игрок передает свои корабли
    this.playerBoard = this.createEmptyBoard();
    this.placePlayerShips(playerShips);
    
    // Бот генерирует свои корабли
    this.botBoard = this.generateBotBoard();
    
    this.playerShots = new Set();    // Выстрелы игрока
    this.botShots = new Set();       // Выстрелы бота
    this.lastBotHit = null;          // Последнее попадание бота
    this.gameOver = false;
  }

  // Размещение кораблей игрока
  placePlayerShips(ships) {
    for (const ship of ships) {
      // Преобразование rotation в horizontal
      const horizontal = ship.rotation === 'horizontal';
      
      if (!this.canPlaceShip(this.playerBoard, ship.x, ship.y, ship.dlina, horizontal)) {
        throw new Error(`Невозможно разместить корабль: (${ship.x}, ${ship.y})`);
      }
      this.placeShip(this.playerBoard, ship.x, ship.y, ship.dlina, horizontal);
    }
  }

  createEmptyBoard() {
    return Array(10).fill().map(() => Array(10).fill(0));
  }

  generateBotBoard() {
    const board = this.createEmptyBoard();
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Размеры кораблей
    
    for (const size of ships) {
      let placed = false;
      while (!placed) {
        const horizontal = Math.random() < 0.5;
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        
        if (this.canPlaceShip(board, x, y, size, horizontal)) {
          this.placeShip(board, x, y, size, horizontal);
          placed = true;
        }
      }
    }
    return board;
  }

  canPlaceShip(board, x, y, size, horizontal) {
    // Проверка выхода за границы
    if (horizontal) {
      if (y + size > 10) return false;
    } else {
      if (x + size > 10) return false;
    }

    // Проверка пересечения с другими кораблями и соседними клетками
    for (let i = -1; i <= size; i++) {
      for (let j = -1; j <= 1; j++) {
        let checkX, checkY;
        
        if (horizontal) {
          checkX = x + j;
          checkY = y + i;
        } else {
          checkX = x + i;
          checkY = y + j;
        }
        
        if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10) {
          if (board[checkX][checkY] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placeShip(board, x, y, size, horizontal) {
    for (let i = 0; i < size; i++) {
      if (horizontal) {
        board[x][y + i] = 1; // 1 означает корабль
      } else {
        board[x + i][y] = 1;
      }
    }
  }

  // Обработка выстрела игрока
  playerAttack(x, y) {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      throw new Error('Недопустимые координаты');
    }
    
    const key = `${x},${y}`;
    if (this.playerShots.has(key)) {
      throw new Error('Вы уже стреляли в эту клетку');
    }
    
    this.playerShots.add(key);
    const hit = this.botBoard[x][y] === 1;
    
    // Обновляем состояние доски бота
    this.botBoard[x][y] = hit ? 2 : -1; // 2 - попадание, -1 - промах
    
    // Проверка победы игрока
    if (this.checkWin(this.botBoard)) {
      this.gameOver = true;
      return { 
        hit, 
        gameOver: true, 
        winner: 'player' 
      };
    }

    // Ход бота
    const botResult = this.botAttack();
    
    return { 
      hit,
      botAttack: botResult,
      gameOver: this.gameOver
    };
  }

  botAttack() {
    let x, y, key;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      // Интеллектуальный выстрел вокруг последнего попадания
      if (this.lastBotHit && attempts < 20) {
        [x, y] = this.getNearbyCell(this.lastBotHit);
      } 
      // Случайный выстрел
      else {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      }
      
      key = `${x},${y}`;
      attempts++;
    } while (this.botShots.has(key) && attempts < maxAttempts);

    this.botShots.add(key);
    const hit = this.playerBoard[x][y] === 1;
    
    if (hit) {
      this.playerBoard[x][y] = 2; // Помечаем попадание
      this.lastBotHit = { x, y };
      
      // Проверка победы бота
      if (this.checkWin(this.playerBoard)) {
        this.gameOver = true;
        return { 
          x, 
          y, 
          hit: true, 
          gameOver: true, 
          winner: 'bot' 
        };
      }
    } else {
      this.playerBoard[x][y] = -1; // Помечаем промах
      this.lastBotHit = null;
    }

    return { 
      x, 
      y, 
      hit 
    };
  }

  getNearbyCell(pos) {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    
    const newX = Math.max(0, Math.min(9, pos.x + randomDir[0]));
    const newY = Math.max(0, Math.min(9, pos.y + randomDir[1]));
    
    return [newX, newY];
  }

  checkWin(board) {
    // Проверяем, остались ли неподбитые корабли
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (board[x][y] === 1) return false; // Найден неподбитый корабль
      }
    }
    return true;
  }
}

// Создание новой игры
app.post('/api/games', (req, res) => {
  try {
    const shipsData = req.body;

    // Проверка формата данных
    if (!Array.isArray(shipsData)) {
      return res.status(400).json({ error: "Необходимо передать массив кораблей" });
    }
    
    // Проверка количества кораблей
    if (shipsData.length !== 10) {
      return res.status(400).json({ error: "Должно быть ровно 10 кораблей" });
    }
    
    // Проверка структуры каждого корабля
    const requiredFields = ['dlina', 'x', 'y', 'rotation'];
    for (const ship of shipsData) {
      for (const field of requiredFields) {
        if (!(field in ship)) {
          return res.status(400).json({ error: `Корабль должен содержать поле: ${field}` });
        }
      }
      
      // Проверка допустимых значений rotation
      if (!['horizontal', 'vertical'].includes(ship.rotation)) {
        return res.status(400).json({ 
          error: `Недопустимое значение rotation: ${ship.rotation}. Допустимые значения: horizontal, vertical` 
        });
      }
    }

    // Создаем игру
    const game = new Game(shipsData);
    games.set(game.id, game);

    res.status(201).json({
      gameId: game.id,
      message: "Игра успешно создана! Корабли размещены."
    });

  } catch (error) {
    res.status(400).json({ 
      error: error.message || "Ошибка при создании игры" 
    });
  }
});

// Обработка атаки
app.post('/api/games/:gameId/attacks', (req, res) => {
  try {
    const gameId = req.params.gameId;
    const { x, y } = req.body;
    
    // Проверка координат
    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ error: "Координаты x и y должны быть числами" });
    }
    
    if (x < 0 || x > 9 || y < 0 || y > 9) {
      return res.status(400).json({ error: "Координаты должны быть в диапазоне 0-9" });
    }
    
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    
    if (game.gameOver) {
      return res.status(400).json({ error: 'Игра уже завершена' });
    }
    
    // Обрабатываем ход
    const result = game.playerAttack(x, y);
    
    // Если игра завершена, удаляем ее из хранилища
    if (result.gameOver) {
      games.delete(gameId);
    }
    
    res.json(result);
    
  } catch (error) {
    res.status(400).json({ error: error.message || "Ошибка при обработке хода" });
  }
});

// Получение информации об игре
app.get('/api/games/:gameId', (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    
    // Возвращаем только необходимую информацию
    res.json({
      gameId: game.id,
      gameOver: game.gameOver,
      playerShots: Array.from(game.playerShots),
      botShots: Array.from(game.botShots)
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});