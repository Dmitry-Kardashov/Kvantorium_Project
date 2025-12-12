const controller = new AbortController();
let arrayCells = [];
let arrayCellsEnemy = [];
let pole = []
let pole_prot = []
let id;
let test = [];
let ItemPos
let ItemPosBot

async function initializationGame(array) {
  console.log(array)
  let response = await fetch('http://http://146.158.127.131:3001/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      playerField: array
    })
  });

  let res = await response.json()
  id = res.gameId
  pole_prot = res.pole_prot
  console.log(res)
}

async function attackEnemy(id, x, y) {


  let response1 = await fetch(`http://http://146.158.127.131:3001/game/${id}/attacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({x: x-1, y: y-1})
    })
    
  let res = await response1.json()
  console.log(res)
  if(res.playerResult.hit == true) {
      console.log("попал")
      PrintHit(x, y)
    }
    else {
      console.log("не попал")
      PrintMiss(x, y)
    }
    if(res.computerResult.hit == true) {
      PrintHitBot(res)
    }
    else {
      PrintMissBot(res)
    }

  if(res.gameOver.computerWins == true) {
      alert("Игра завершена. Победил бот");
  }
  else if(res.gameOver.playerWins == true) {
      alert("Игра завершена. Вы выиграли!");
  }
  
}


document.addEventListener("DOMContentLoaded", function() {
  let startBtn = document.querySelector(".start-game") 
  let pole_text = document.querySelector(".polya")
  let pole_knopka = document.querySelector(".save-button")
  startBtn.addEventListener("click", function() {
    startGame()
    pole_text.classList.remove("none")
    pole_knopka.classList.remove("none")
    startBtn.classList.add("none")
    })
    
    })
    
    
  function startGame() {
    let container = document.createElement("div")
    container.classList.add("game")
    let container1 = document.createElement("div")
    container1.classList.add("game")
    let ships = []
    pole = createShufflePole()
    pole_prot = createShufflePole()

    for(let i=0; i<pole.length; i++) {
      for(let b=0; b<pole[i].length; b++) {
        let item = createItem(pole, pole[i][b], i, b, "my")
        container.append(item)
      }
    }
  
  for(let i=0; i<pole_prot.length; i++) {
    for(let b=0; b<pole_prot[i].length; b++) {
      let item_prot = createItem(pole_prot, pole_prot[i][b], i, b, "prot")
      container1.append(item_prot)
      
    }
  }
  
  
  let container2 = document.querySelector(".container")
  container2.append(container)
  container2.append(container1)
  
  pole.splice(0, 1)
  pole.forEach(el => el.splice(0, 1))

  pole_prot.splice(0, 1)
  pole_prot.forEach(el => el.splice(0, 1))
  
  
  let pole_knopka = document.querySelector(".save-button")
  pole_knopka.addEventListener("click", function() {
    let restart_text = document.querySelector(".restart_text")
    let restart_btn = document.querySelector(".restart_button")
    let save_button = document.querySelector(".save-button")
    restart_text.classList.add("none")
    restart_btn.classList.add("none")
    save_button.classList.add("none")
    Validate(pole)
  })
  
  
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


function PrintMissBot(res) {
  ItemPosBot = (res.computerResult.y) * 10 + res.computerResult.x
  arrayCells[ItemPosBot].item.classList.add("hit")
}

function PrintHitBot(res) {
  ItemPosBot = (res.computerResult.y) * 10 + res.computerResult.x
  arrayCells[ItemPosBot].item.classList.add("kill")
}


function PrintMiss(x, y) {
  
  // console.log(arrayCellsEnemy)
  ItemPos = y * 10 - 10 + x
  arrayCellsEnemy[ItemPos-1].item.classList.add("miss")
}

function PrintHit(x, y) {
  ItemPos = y * 10 - 10 + x
  arrayCellsEnemy[ItemPos-1].item.classList.add("kill")
}



function createHeadingRow() {   
  let item = document.createElement("div")
  item.classList.add("game_item")
  item.textContent = isShip
  item.style.background = "RED"
}
        
function createItem(pole, znach, y, x, type) {     
  let setCol = 0
  let alphabet = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"]
  // let alphabet = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
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
    if(type == "my") {
          arrayCells.push(
        {
          item:item,
          x:x,
          y:y
        })
      item.addEventListener("click", function() {
      if (setCol == 0) {
        setCol = 1  
        item.style.background = "rgb(229, 233, 240)"
        pole[y-1][x-1] = 1
      }
  
      else {
        setCol = 0
        item.style.background = "transparent"
        pole[y-1][x-1] = 0
  
      }}, { signal: controller.signal })
    }
    else {
      arrayCellsEnemy.push({
          item: item,
          x: x,
          y: y,
      })
      item.addEventListener("click", function() {
          attackEnemy(id, x, y)
      })
    }
  }

  return item;

}
          
function Validate(pole)
{
  let sum = 0
  let kletki = 0
  for(let i=0; i<pole.length; i++) {
    for(let b=0; b<pole[i].length; b++) {
      if(pole[i][b] == 1) {
        NeighborsValidate(pole, i, b)
        kletki ++;
        }
    }
  }
  if(kletki != 20) {
    RebootGame();
  }
  ShipsValidate(pole)
  ValidateAllShips(ships)

}
        
function NeighborsValidate(pole, x, y) {
let sum = 0
if (x == 0 && y == 0) {
  sum = pole[x+1][y] + pole[x][y+1] + pole[x+1][y+1]
  if(sum > 1) {
    RebootGame()
    return;
  }
  if(pole[x+1][y+1] == 1) 
  {
    RebootGame();
  }
}
else if(x == 0 && y == 9) {
  sum = pole[x+1][y] + pole[x][y-1] + pole[x+1][y-1]
  if(sum > 1) {
    RebootGame()
    return;
  }
if(pole[x+1][y-1] == 1) 
  {
    RebootGame();
  }
}
if (x == 9 && y == 0) {
  sum = pole[x-1][y] + pole[x][y+1] + pole[x-1][y+1]
  if(sum > 1) {
    RebootGame()
    return;
  }
if(pole[x-1][y+1] == 1) 
  {
    RebootGame();
  }
}
else if (x == 9 && y == 9) { 
  sum = pole[x-1][y] + pole[x][y-1] + pole[x-1][y-1]
  if(sum > 1) {
    RebootGame()
    return;
  }
  if(pole[x-1][y-1] == 1) 
    {
      RebootGame();
    }
}
if(x != 9) 
{
  if (pole[x+1][y] == 1 && pole[x][y+1] == 1) {
    RebootGame()
    return;
  }
  if (pole[x+1][y] == 1 && pole[x][y-1] == 1) {
    RebootGame()
    return;
  }
}
if(x != 0) 
{
if (pole[x-1][y] == 1 && pole[x][y+1] == 1) {
  RebootGame()
  return;
}
if (pole[x-1][y] == 1 && pole[x][y-1] == 1) {
  RebootGame()
  return;
}
}
let sumUgl = 0;
for(let i=-1; i<2; i+=2) {
for(let b=-1; b<2; b+=2) {
    if(x+i > 9 || x+i < 0 || y+b > 9 || y+b < 0) {
      continue;
    }
    if(pole[x+i][y+b] == 1) {
      sumUgl += 1;
    }
}
}

if(sumUgl > 0) {
  RebootGame();
}
else {
}  return 1;

}

function ShipsValidate(pole) {
  const validatePole = pole.map(row => [...row]); // Глубокая копия
  ships = [];
  let ships_count = 0;

  for (let y = 0; y < validatePole.length; y++) {
    for (let x = 0; x < validatePole[0].length; x++) {
      if (validatePole[y][x] === 1) {
        const ship = { dlina: 0, x, y, rotation: null };
        // Проверка направления корабля
        const horizontal = (x < 9 && validatePole[y][x + 1] === 1);
        const vertical = (y < 9 && validatePole[y + 1][x] === 1);

        if (horizontal) {
          ship.rotation = 'horizontal';
          while (x + ship.dlina < 10 && validatePole[y][x + ship.dlina] === 1) {
            validatePole[y][x + ship.dlina] = 0; // Пометить как обработанную
            ship.dlina++;
          }
        } else if (vertical) {
          ship.rotation = 'vertical';
          while (y + ship.dlina < 10 && validatePole[y + ship.dlina][x] === 1) {
            validatePole[y + ship.dlina][x] = 0; // Пометить как обработанную
            ship.dlina++;
          }
        } else {
          ship.dlina = 1; // Однопалубный
          validatePole[y][x] = 0;
        }
        ships.push(ship);
        ships_count++;
      }
    }
  }
}

function SingleShipsValidate(i, b, validatePole, ships, ships_count, obj, count, rotation) {
  if(i == 0 && b == 0) {
    if(validatePole[i+1][b] == 0 && validatePole[i][b+1] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i == 0 && b == 9) {
    if(validatePole[i][b-1] == 0 && validatePole[i+1][b] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i == 9 && b == 0) {
    if(validatePole[i-1][b] == 0 && validatePole[i][b+1] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i == 9 && b == 9) {
    if(validatePole[i-1][b] == 0 && validatePole[i][b-1] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i == 0 && b != 0 && b != 9) {
    if(validatePole[i][b+1] == 0 && validatePole[i][b-1] == 0 && validatePole[i+1][b] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i == 9 && b != 0 && b != 9) {
    if(validatePole[i][b+1] == 0 && validatePole[i][b-1] == 0 && validatePole[i-1][b] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(b == 0 && i != 0 && i != 9) {
    if(validatePole[i+1][b] == 0 && validatePole[i-1][b] == 0 && validatePole[i][b+1] == 0 ) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(b == 9 && i != 0 && i != 9) {
    if(validatePole[i+1][b] == 0 && validatePole[i-1][b] == 0 && validatePole[i][b-1] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }
  if(i != 0 && i != 9 && b != 0 && b != 9) {
    if(validatePole[i][b+1] == 0 && validatePole[i][b-1] == 0 && validatePole[i+1][b] == 0 && validatePole[i-1][b] == 0) {
      dlina = 1
      AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
      return true;
    }
  }

  return false;
  
}

function AddShip(i, b, dlina, obj, ships, ships_count, count, rotation) {
  ships_count += 1
  obj.dlina = dlina
  obj.x = b
  obj.y = i
  obj.rotation = rotation
  ships.push(obj)
  count = 1;
}


function RebootGame() {
let restart_text = document.querySelector(".restart_text")
let restart_btn = document.querySelector(".restart_button")
console.log("Неверная растановка кораблей")
restart_text.classList.remove("none")
restart_btn.classList.remove("none")
console.log(restart_text, restart_btn)
restart_btn.addEventListener("click", function() {
  location.reload()
})
}

function ValidateAllShips(ships) {
  let ships1 = 0;
  let ships2 = 0;
  let ships3 = 0;
  let ships4 = 0;
  if(ships.length != 10) {
    RebootGame()
    return;
  }

  for(let i = 0; i < ships.length; i++) {
    if(ships[i].dlina == 1) {
      ships1 += 1
    }
    if(ships[i].dlina == 2) {
      ships2 += 1
    }
    if(ships[i].dlina == 3) {
      ships3 += 1
    }
    if(ships[i].dlina == 4) {
      ships4 += 1
    }
    if(ships[i].dlina > 4) {
      RebootGame();
    }
  }

  if(!(ships1 == 4 && ships2 == 3 && ships3 == 2 && ships4 == 1)) {
    RebootGame()
  } 

  controller.abort();
  console.log(ships)
  console.log(pole, pole_prot)
  initializationGame(pole);
}
