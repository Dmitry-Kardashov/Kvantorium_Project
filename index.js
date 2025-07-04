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
  let response = await fetch('http://localhost:3001/api/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(array)
  });
  let res = await response.json()
  id = res.gameId
  pole_prot = res.pole_prot
  console.log(res)
}

async function attackEnemy(id, x, y) {
  let response1 = await fetch(`http://localhost:3001/api/games/${id}/attacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({x: x-1, y: y-1})
    })
    
  let res = await response1.json()
  console.log(res)
  if(res.hit == true) {
    PrintHit(x, y)
  }
  else {
    PrintMiss(x, y)
  }
  if(res.botAttack.hit == true) {
    PrintHitBot(res)
  }
  else {
    PrintMissBot(res)
  }

  if(res.botAttack.gameOver == true) {
    if(res.botAttack.winner == "bot")
    {
      alert("Игра завершена. Победил бот");
    }
    else if(res.gamebotAttackOver.winner == "player") {
      alert("Игра завершена. Вы выйграли!");
    }
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
      // arrayCellsEnemy.push(
        //   {
          //     item:item_prot,
      //     x:b,
      //     y:i
      //   })
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
  console.log(res.botAttack.x + " x")
  console.log(res.botAttack.y + " y")
  ItemPos = (res.botAttack.y) * 10 + res.botAttack.x
  arrayCells[ItemPos].item.classList.add("hit")
  console.log(ItemPos)
}

function PrintHitBot(res) {
  console.log(res.botAttack.x + " x")
  console.log(res.botAttack.y + " y")
  ItemPos = (res.botAttack.y) * 10 + res.botAttack.x
  // arrayCells[ItemPos].item.classList.remove("hit")
  arrayCells[ItemPos].item.classList.add("kill")
  console.log(ItemPos)
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
  // let alphabet = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"]
  let alphabet = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
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
// if(pole[x+1][y+1] == 1 || pole[x-1][y-1] == 1 || pole[x-1][y+1] == 1 || pole[x+1][y-1] == 1) {}
else {
}  return 1;

}

function ShipsValidate(pole) {
let validatePole = [...pole]
ships = []
// ships.korda_x = 1
// ships.korda_y = 2
let ships_count = 0

for(let i=0; i<validatePole.length; i++) {
  for(let b=0; b<validatePole[0].length; b++) {
    if(validatePole[i][b] == 1) {
      let dlina = 1;
      let count = 1;
      let rotation = null;
      let obj = {}
      SingleShipsValidate(i, b, validatePole, ships, ships_count, obj, count, rotation)
      if(SingleShipsValidate == 1) {
        continue;
      }
   
      if(i != 9) {
        if(validatePole[i+count][b] == 1) {
          while (validatePole[i+count][b] == 1) {
              dlina += 1;
              count += 1;
              if(i+count > 9) {
                break;
              }
            }
              
          if(i != 0) {
          if(validatePole[i-1][b] == 1) {
            continue;
          }
        }
        rotation = "vertical"
        AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
        continue;
        }
      }
      if(b != 9) {
        if(validatePole[i][b+count] == 1) {
          while (validatePole[i][b+count] == 1) {
            dlina += 1;
            count += 1;
            
            if(b+count > 9) {
              break;
            }
          }

          if(b != 0) {
            if(validatePole[i][b-1] == 1) {
              continue;
            }
          }
          rotation = "horizontal"
          AddShip(i, b, dlina, obj, ships, ships_count, count, rotation)
          continue;
        }
      }
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
  initializationGame(ships);
}
