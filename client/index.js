document.addEventListener("DOMContentLoaded", function() {
    // let input = document.querySelector(".input-count")
        let startBtn = document.querySelector(".start-game")
        startBtn.addEventListener("click", function() {
         startGame ()
        
        })
    
     })
        

    function startGame() {
    let container = document.createElement("div")
    container.classList.add("game")
    // let pole = []
    let pole = createShufflePole()
    console.log(pole)
    for(let i=0; i<pole.length; i++) {
      for(let b=0; b<pole[i].length; b++) {
        let item = createItem(pole, pole[i][b], i, b)
        container.append(item)
      }
    }
    
    console.log(container)
    
    document.body.append(container)
}

function createShufflePole() {
    
    let pole = []
    // I - высота
    // B - ширина
    for(let i=0; i< 11; i++) {
        pole.push(new Array())
        for(let b=0; b<11; b++) {
          pole[i][b] = 0
          if(b == 0) {
            pole[i][b] = i
          }
          if(i == 0) {
            pole[i][b] = b
          }
        }
    }
    return pole
      
} 

function createHeadingRow() {

  let item = document.createElement("div")
  item.classList.add("game_item")
}

function createItem(pole, znach, y, x) {
    let setCol = 0
    let alphabet = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"]
    // console.log(pole, znach)
    let item = document.createElement("div")
    item.classList.add("game_item")

    
    if(znach != 0 ) {
      item.textContent = znach
      item.classList.add("item-heading")
    }
      
    if(y == 0) {
      item.textContent = alphabet[x-1]
      item.classList.add("item-heading")
    }

    if(x != 0 && y != 0) {
      item.addEventListener("click", function() {
        if (!setCol) {
          setCol = 1  
          item.style.background = "rgb(59, 66, 82)"
        }
        else  
        {
          setCol = 0
          item.style.background = "rgb(216, 222, 233)"
        }
      })
    }


return item;

}

// // Импортируем библиотеку socket.io-client
// import io from 'socket.io-client';

// // Подключаемся к серверу
// const socket = io('http://localhost:5500');

// // ID комнаты (замените на реальный ID комнаты, полученный при создании комнаты)
// const roomId = 'ABC123';

// // ID игрока (замените на реальный ID игрока, полученный от сервера)
// const playerId = 'socketId1';

// // Подключение к комнате
// socket.emit('joinRoom', roomId);

// // Слушаем событие "gameStart", которое сервер отправляет, когда игра начинается
// socket.on('gameStart', (gameState) => {
//     console.log('Игра началась! Текущее состояние:', gameState);

//     // Пример хода игрока
//     const move = {
//         player: playerId, // ID игрока
//         target: { x: 3, y: 5 } // Координаты выстрела
//     };

//     // Отправляем ход на сервер
//     socket.emit('makeMove', roomId, move);
// });

// // Слушаем событие "gameStateUpdated", которое сервер отправляет после каждого хода
// socket.on('gameStateUpdated', (gameState) => {
//     console.log('Состояние игры обновлено:', gameState);
// });

// // Слушаем событие "playerJoined", которое сервер отправляет, когда новый игрок подключается к комнате
// socket.on('playerJoined', (players) => {
//     console.log('Игроки в комнате:', players);
// });

// // Обработка ошибок
// socket.on('connect_error', (error) => {
//     console.error('Ошибка подключения:', error);
// });