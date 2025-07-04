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
    
    // Игрок передает свои корабли - без валидации
    this.playerBoard = this.createEmptyBoard();
    this.placePlayerShips(playerShips);
    
    // Бот генерирует свои корабли - с валидацией
    this.botBoard = this.generateBotBoard();
    
    this.playerShots = new Set();
    this.botShots = new Set();
    this.lastBotHit = null;
    this.gameOver = false;
  }

  // Размещение кораблей игрока без проверок
  placePlayerShips(ships) {
    for (const ship of ships) {
      const horizontal = ship.rotation === 'horizontal';
      this.placeShip(this.playerBoard, ship.x, ship.y, ship.dlina, horizontal);
    }
  }

  createEmptyBoard() {
    return Array(10).fill().map(() => Array(10).fill(0));
  }

  // Генерация кораблей бота с проверкой
  generateBotBoard() {
    const board = this.createEmptyBoard();
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Размеры кораблей
    
    for (const size of ships) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() < 0.5;
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        
        if (this.canPlaceShip(board, x, y, size, horizontal)) {
          this.placeShip(board, x, y, size, horizontal);
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

  // Валидация для кораблей бота
  canPlaceShip(board, x, y, size, horizontal) {
    // Проверка выхода за границы
    if (horizontal) {
      if (y + size > 10) return false;
    } else {
      if (x + size > 10) return false;
    }

    // Проверка области вокруг корабля
    for (let along = -1; along <= size; along++) {
      for (let across = -1; across <= 1; across++) {
        let checkX, checkY;
        
        if (horizontal) {
          checkX = x + across;
          checkY = y + along;
        } else {
          checkX = x + along;
          checkY = y + across;
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

  // Размещение корабля с защитой от выхода за границы
  placeShip(board, y, x, size, horizontal) {
    for (let i = 0; i < size; i++) {
      if (horizontal) {
        if (y + i < 10) {
          board[x][y + i] = 1;
        }
      } else {
        if (x + i < 10) {
          board[x + i][y] = 1;
        }
      }
    }
  }

  // Обработка выстрела игрока (без изменений)
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
    
    this.botBoard[x][y] = hit ? 2 : -1;
    
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
      if (this.lastBotHit && attempts < 20) {
        [x, y] = this.getNearbyCell(this.lastBotHit);
      } else {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      }
      
      key = `${x},${y}`;
      attempts++;
    } while (this.botShots.has(key) && attempts < maxAttempts);

    this.botShots.add(key);
    const hit = this.playerBoard[x][y] === 1;
    
    if (hit) {
      this.playerBoard[x][y] = 2;
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
      this.playerBoard[x][y] = -1;
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
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (board[x][y] === 1) return false;
      }
    }
    return true;
  }

  // get botBoard() {
  //   return this.botBoard
  // }

  // set botBoard(botBoard) {
  //   this.botBoard = botBoard
  // }
}

// Создание новой игры без валидации пользовательских кораблей
app.post('/api/games', (req, res) => {
  try {
    const shipsData = req.body;
    
    // Минимальная проверка формата
    if (!Array.isArray(shipsData)) {
      return res.status(400).json({ error: "Необходимо передать массив кораблей" });
    }
    
    const game = new Game(shipsData);
    games.set(game.id, game);

    res.status(201).json({
      gameId: game.id,
      pole_prot: game.botBoard,
      message: "Игра успешно создана! Корабли игрока размещены без валидации."
    });

  } catch (error) {
    res.status(400).json({ 
      error: error.message || "Ошибка при создании игры" 
    });
  }
});

// Остальные endpoint'ы без изменений
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