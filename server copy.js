const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const games = new Map();

class Game {
  constructor(playerShips) {
    this.id = uuidv4();
    this.playerBoard = this.createEmptyBoard();
    this.placePlayerShips(playerShips);
    this.botBoard = this.generateBotBoard();
    this.playerShots = new Set();
    this.botShots = new Set();
    this.lastBotHit = null;
    this.gameOver = false;
  }

  createEmptyBoard() {
    const board = [];
    for (let i = 0; i < 10; i++) {
      board[i] = Array(10).fill(0);
    }
    return board;
  }

  placePlayerShips(ships) {
    for (const ship of ships) {
      // Правильная интерпретация координат:
      // ship.x = столбец (от клиента)
      // ship.y = строка (от клиента)
      const horizontal = ship.rotation === 'horizontal';
      
      this.placeShip(
        this.playerBoard,
        ship.y,  // строка
        ship.x,  // столбец
        ship.dlina,
        horizontal
      );
    }
  }

  generateBotBoard() {
    const board = this.createEmptyBoard();
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    
    for (const size of ships) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() < 0.5;
        const x = Math.floor(Math.random() * 10); // столбец
        const y = Math.floor(Math.random() * 10); // строка
        
        if (this.canPlaceShip(board, x, y, size, horizontal)) {
          this.placeShip(board, y, x, size, horizontal);
          placed = true;
        }
        attempts++;
      }
      
      if (!placed) {
        throw new Error('Не удалось разместить корабли бота');
      }
    }
    return board;
  }

  canPlaceShip(board, x, y, size, horizontal) {
    // Проверка выхода за границы
    if (horizontal) {
      if (x + size > 10) return false;
    } else {
      if (y + size > 10) return false;
    }

    // Проверка области вокруг корабля
    for (let i = 0; i < size; i++) {
      const cx = horizontal ? x + i : x;
      const cy = horizontal ? y : y + i;
      
      // Проверяем 3x3 область вокруг каждой клетки корабля
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = cx + dx;
          const ny = cy + dy;
          
          if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
            if (board[nx][ny] !== 0) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  placeShip(board, x, y, size, horizontal) {
    for (let i = 0; i < size; i++) {
      // Правильные формулы:
      const posX = horizontal ? x + i : x;
      const posY = horizontal ? y : y + i;

      if (posX >= 10 || posY >= 10) {
        throw new Error(`Корабль выходит за границы: [${posX},${posY}]`);
      }

      if (board[posX][posY] !== 0) {
        throw new Error(`Невозможно разместить корабль в занятой ячейке: [${posX},${posY}]`);
      }

      board[posX][posY] = 1;
    }
  }

  playerAttack(x, y) {
    // x = столбец, y = строка
    
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error('Координаты должны быть целыми числами');
    }
    
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      throw new Error('Недопустимые координаты');
    }

    const row = this.botBoard[x];
    if (!row) {
      throw new Error(`Недопустимая строка доски: ${x}`);
    }
    
    const cellValue = row[y];
    if (cellValue === undefined) {
      throw new Error(`Недопустимая колонка доски: ${y}`);
    }

    
    const key = `${x},${y}`;
    if (this.playerShots.has(key)) {
      throw new Error('Вы уже стреляли в эту клетку');
    }
    
    this.playerShots.add(key);

    console.log(`Выстрел по: (${x},${y})`);
    console.log(`Значение ячейки:`, this.botBoard[x][y]);
    console.log(`Тип ячейки:`, typeof this.botBoard[x][y]);
    const hit = cellValue === 1;  // [строка][столбец]
    if (hit) {
      this.botBoard[x][y] = 2;   // Было [y][x]
    } else {
      this.botBoard[x][y] = -1;  // Было [y][x]
    }
    
    if (this.checkWin(this.botBoard)) {
      this.gameOver = true;
      return { 
        hit, 
        gameOver: true, 
        winner: 'player' 
      };
    }

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
      if (this.lastBotHit) {
        const directions = [[1,0], [0,1], [-1,0], [0,-1]];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        x = this.lastBotHit.x + randomDir[0];
        y = this.lastBotHit.y + randomDir[1];
      } else {
        x = Math.floor(Math.random() * 10); // столбец
        y = Math.floor(Math.random() * 10); // строка
      }
      
      key = `${x},${y}`;
      attempts++;
    } while ((x < 0 || x >= 10 || y < 0 || y >= 10 || this.botShots.has(key)) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback to random if stuck
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      key = `${x},${y}`;
    }

    this.botShots.add(key);
    const hit = this.playerBoard[y][x] === 1;  // [строка][столбец]
    
    if (hit) {
      this.playerBoard[y][x] = 2;
      this.lastBotHit = { x, y };
      
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
      this.playerBoard[y][x] = -1;
    }

    return { 
      x, 
      y, 
      hit 
    };
  }

  checkWin(board) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (board[y][x] === 1) return false;
      }
    }
    return true;
  }
}

app.post('/api/games', (req, res) => {
  try {
    const shipsData = req.body;
    
    if (!Array.isArray(shipsData)) {
      return res.status(400).json({ error: "Необходимо передать массив кораблей" });
    }
    
    const game = new Game(shipsData);
    games.set(game.id, game);

    res.status(201).json({
      gameId: game.id,
      pole_prot: game.botBoard,
      pole_NEprot: game.playerBoard,
      message: "Игра успешно создана!"
    });

  } catch (error) {
    res.status(400).json({ 
      error: error.message || "Ошибка при создании игры" 
    });
  }
});

app.post('/api/games/:gameId/attacks', (req, res) => {
  try {
    const gameId = req.params.gameId;
    const { x, y } = req.body;
    
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
    
    const result = game.playerAttack(x, y);
    
    if (result.gameOver) {
      games.delete(gameId);
    }
    
    res.json(result);
    
  } catch (error) {
    res.status(400).json({ error: error.message || "Ошибка при обработке хода" });
  }
});

app.get('/api/games/:gameId', (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    
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