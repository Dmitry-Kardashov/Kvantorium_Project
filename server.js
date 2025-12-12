const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Структура для хранения игры
const games = {};

// Генерация пустого поля 10x10
function createEmptyField() {
  return Array(10).fill().map(() => Array(10).fill(0));
}

function canPlaceShip(field, x, y, size, isHorizontal) {
  // Проверка выхода за границы поля
  if (isHorizontal) {
    if (x + size > 10) return false;
  } else {
    if (y + size > 10) return false;
  }

  // Проверяем всю область вокруг корабля (включая диагонали)
  for (let dy = -1; dy <= (isHorizontal ? 1 : size); dy++) {
    for (let dx = -1; dx <= (isHorizontal ? size : 1); dx++) {
      const checkX = x + dx;
      const checkY = y + dy;
      
      // Пропускаем невалидные координаты
      if (checkX < 0 || checkX >= 10 || checkY < 0 || checkY >= 10) continue;
      
      // Определяем, является ли клетка частью корабля или зоной вокруг
      const isShipCell = isHorizontal 
        ? (dy === 0 && dx >= 0 && dx < size)
        : (dx === 0 && dy >= 0 && dy < size);
      
      // Если в клетке уже есть корабль и это не часть текущего размещаемого корабля - ошибка
      if (field[checkY][checkX] === 1 && !isShipCell) {
        return false;
      }
    }
  }
  
  return true;
}

// Размещение корабля
function placeShip(field, x, y, size, isHorizontal) {
  const shipCells = [];
  if (isHorizontal) {
    for (let i = 0; i < size; i++) {
      field[y][x + i] = size; 
      shipCells.push({ x: x + i, y });
    }
  } else {
    for (let i = 0; i < size; i++) {
      field[y + i][x] = size;
      shipCells.push({ x, y: y + i });
    }
  }
  return shipCells;
}

function generateComputerField() {
  const field = Array(10).fill().map(() => Array(10).fill(0));
  const ships = [];
  const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  
  for (const size of shipSizes) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 1000) {
      attempts++;
      const isHorizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      
      if (canPlaceShip(field, x, y, size, isHorizontal)) {
        const shipCells = [];
        
        if (isHorizontal) {
          for (let i = 0; i < size; i++) {
            field[y][x + i] = 1;
            shipCells.push({x: x + i, y});
          }
        } else {
          for (let i = 0; i < size; i++) {
            field[y + i][x] = 1;
            shipCells.push({x, y: y + i});
          }
        }
        
        ships.push(shipCells);
        placed = true;
      }
    }
    
    if (!placed) {
      return generateComputerField();
    }
  }
  
  if (!validateComputerField(field)) {
    return generateComputerField();
  }
  
  return { field, ships };
}

function validateComputerField(field) {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (field[y][x] === 1) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
              if ((dx !== 0 || dy !== 0) && field[ny][nx] === 1) {
                const isConnected = (dx === 0 || dy === 0) && 
                  ((nx > 0 && field[ny][nx-1] === 1) || 
                   (nx < 9 && field[ny][nx+1] === 1) ||
                   (ny > 0 && field[ny-1][nx] === 1) ||
                   (ny < 9 && field[ny+1][nx] === 1));
                
                if (!isConnected) {
                  return false;
                }
              }
            }
          }
        }
      }
    }
  }
  return true;
}

function extractShips(field) {
  const ships = [];
  const visited = Array(10).fill().map(() => Array(10).fill(false));
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (field[y][x] === 1 && !visited[y][x]) {
        const ship = [];
        const queue = [{x, y}];
        
        while (queue.length > 0) {
          const {x: cx, y: cy} = queue.shift();
          
          if (cx < 0 || cx >= 10 || cy < 0 || cy >= 10) continue;
          if (visited[cy][cx] || field[cy][cx] !== 1) continue;
          
          visited[cy][cx] = true;
          ship.push({x: cx, y: cy});
          
          queue.push({x: cx + 1, y: cy});
          queue.push({x: cx - 1, y: cy});
          queue.push({x: cx, y: cy + 1});
          queue.push({x: cx, y: cy - 1});
        }
        
        ships.push(ship);
      }
    }
  }
  
  return ships;
}

app.post('/game', (req, res) => {
  try {
    const playerField = req.body.playerField; 
    
    if (!Array.isArray(playerField) || playerField.length !== 10 ||
        playerField.some(row => !Array.isArray(row) || row.length !== 10)) {
      return res.status(400).json({ 
        error: "Invalid field format. Expected 10x10 array" 
      });
    }
    
    const computerField = generateComputerField();
    
    const gameId = Date.now().toString();
    
    games[gameId] = {
      playerField: {
        field: playerField, 
        ships: extractShips(playerField) 
      },
      computerField: computerField,
      playerShots: [],
      computerShots: []
    };
    
    const maskedComputerField = computerField.field.map(row => 
      row.map(cell => cell > 0 ? 0 : cell)
    );
    
    res.json({ 
      gameId,
      computerField: maskedComputerField
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/game/:id/attacks', (req, res) => {
  const gameId = req.params.id;
  const { x, y } = req.body;
  const game = games[gameId];
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (game.playerShots.some(shot => shot.x === x && shot.y === y)) {
    return res.status(400).json({ error: 'You already shot here' });
  }

  game.playerShots.push({ x, y });
  
  let playerHit = false;
  let playerSunk = false;
  let playerShipSunk = null;
  
  if (game.computerField.field[y][x] === 1) {
    playerHit = true;
    
    const ship = game.computerField.ships.find(s => 
      s.some(cell => cell.x === x && cell.y === y)
    );
    
    const isSunk = ship.every(cell => 
      game.playerShots.some(shot => shot.x === cell.x && shot.y === cell.y)
    );
    
    if (isSunk) {
      playerSunk = true;
      playerShipSunk = ship;
    }
  }

  const playerWins = game.computerField.ships.every(ship =>
    ship.every(cell => 
      game.playerShots.some(shot => shot.x === cell.x && shot.y === cell.y)
    )
  );

  let computerShot = null;
  let computerHit = false;
  let computerSunk = false;
  let computerShipSunk = null;
  let computerWins = false;

  if (!playerWins) {
    computerShot = getSmartShot(game);
    game.computerShots.push(computerShot);
    
    if (game.playerField.field[computerShot.y][computerShot.x] === 1) {
      computerHit = true;
      
      const ship = game.playerField.ships.find(s => 
        s.some(cell => cell.x === computerShot.x && cell.y === computerShot.y)
      );
      
      const isSunk = ship.every(cell => 
        game.computerShots.some(shot => shot.x === cell.x && shot.y === cell.y)
      );
      
      if (isSunk) {
        computerSunk = true;
        computerShipSunk = ship;
      }
    }
    
    computerWins = game.playerField.ships.every(ship =>
      ship.every(cell => 
        game.computerShots.some(shot => shot.x === cell.x && shot.y === cell.y)
      )
    );
  }

  const safeMap = (field, shots, isComputer) => {
    return field.map((row, rowY) => {
      if (!Array.isArray(row)) {
        console.error(`Invalid row at ${rowY}:`, row);
        return Array(10).fill(0);
      }
      
      return row.map((cell, colX) => {
        const wasShot = shots.some(s => s.x === colX && s.y === rowY);
        
        if (isComputer) {
          return wasShot ? (cell === 1 ? 'hit' : 'miss') : 0;
        }
        else {
          return wasShot ? (cell === 1 ? 'hit' : 'miss') : 0;
        }
      });
    });
  };

  const newComputerField = safeMap(
    game.computerField.field, 
    game.playerShots,
    true
  );
  
  const newPlayerField = safeMap(
    game.playerField.field,
    game.computerShots,
    false
  );

  res.json({
    playerResult: {
      hit: playerHit,
      sunk: playerSunk,
      shipSunk: playerShipSunk,
      x,
      y
    },
    computerResult: computerShot ? {
      hit: computerHit,
      sunk: computerSunk,
      shipSunk: computerShipSunk,
      x: computerShot.x,
      y: computerShot.y
    } : null,
    gameOver: {
      playerWins,
      computerWins
    },
    newComputerField,
    newPlayerField
  });
});

function getSmartShot(game) {
  const shots = game.computerShots;
  const field = game.playerField.field;
  
  const lastHit = [...shots].reverse().find(shot => {
    if (field[shot.y][shot.x] !== 1) return false;
    
    const ship = game.playerField.ships.find(s => 
      s.some(cell => cell.x === shot.x && cell.y === shot.y)
    );
    
    return !ship.every(cell => 
      shots.some(s => s.x === cell.x && s.y === cell.y)
    );
  });

  if (lastHit) {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]  // вниз, вправо, вверх, влево
    ];
    
    for (const [dx, dy] of directions) {
      const x = lastHit.x + dx;
      const y = lastHit.y + dy;
      
      if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        if (!shots.some(s => s.x === x && s.y === y)) {
          return { x, y };
        }
      }
    }
  }
  
  const damagedShips = game.playerField.ships.filter(ship => {
    const hitCount = ship.filter(cell => 
      shots.some(s => s.x === cell.x && s.y === cell.y)
    ).length;
    return hitCount >= 1 && hitCount < ship.length;
  });
  
  if (damagedShips.length > 0) {
    const ship = damagedShips[Math.floor(Math.random() * damagedShips.length)];
    
    const hitCells = ship.filter(cell => 
      shots.some(s => s.x === cell.x && s.y === cell.y)
    );
    
    const possibleTargets = [];
    
    for (const cell of ship) {
      if (!shots.some(s => s.x === cell.x && s.y === cell.y)) {
        const neighbors = [
          {x: cell.x - 1, y: cell.y},
          {x: cell.x + 1, y: cell.y}, 
          {x: cell.x, y: cell.y - 1}, 
          {x: cell.x, y: cell.y + 1}  
        ];
        
        for (const neighbor of neighbors) {
          if (neighbor.x >= 0 && neighbor.x < 10 && 
              neighbor.y >= 0 && neighbor.y < 10) {
            if (!shots.some(s => s.x === neighbor.x && s.y === neighbor.y)) {
              possibleTargets.push(neighbor);
            }
          }
        }
      }
    }
    
    if (possibleTargets.length > 0) {
      return possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    }
  }
  
  const availableShots = [];
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (!shots.some(s => s.x === x && s.y === y)) {
        availableShots.push({x, y});
      }
    }
  }
  
  if (availableShots.length === 0) {
    throw new Error('No available shots for computer');
  }
  
  return availableShots[Math.floor(Math.random() * availableShots.length)];
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});