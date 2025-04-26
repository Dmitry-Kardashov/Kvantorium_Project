
let array = [
  {
    item:game_item,
    x : x,
    y : y
  }

]

document.addEventListener("DOMContentLoaded", function() {
  // let input = document.querySelector(".input-count")
  let pole = []
  let pole_prot = []
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
  // let pole = []
  let pole = createShufflePole()
  let pole_prot = createShufflePole()
  console.log(pole)

  for(let i=0; i<pole.length; i++) {
    for(let b=0; b<pole[i].length; b++) {
      let item = createItem(pole, pole[i][b], i, b)
      container.append(item)
    }
  }

  for(let i=0; i<pole_prot.length; i++) {
    for(let b=0; b<pole_prot[i].length; b++) {
      let item_prot = createItem(pole_prot, pole_prot[i][b], i, b)
      container1.append(item_prot)
    }
  }

  
  let container2 = document.querySelector(".container")
  container2.append(container)
  container2.append(container1)
  
  pole.splice(0, 1)
  pole.forEach(el => el.splice(0, 1))
  
  console.log(pole)
  
  let pole_knopka = document.querySelector(".save-button")
  pole_knopka.addEventListener("click", function() {
    let restart_text = document.querySelector(".restart_text")
    let restart_btn = document.querySelector(".restart_button")
    restart_text.classList.add("none")
    restart_btn.classList.add("none")
    Validate(pole, ships)
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
      
function createHeadingRow() {
        
let item = document.createElement("div")
item.classList.add("game_item")
item.textContent = isShip

item.addEventListener("click", function() {
  
}) 
item.style.background = "RED"
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
  if (setCol == 0) {
    setCol = 1  
    item.style.background = "rgb(59, 66, 82)"
    pole[y-1][x-1] = 1
  }

  else {
    setCol = 0
    item.style.background = "transparent"
    pole[y-1][x-1] = 0

  }
  console.log(pole)
  })
  }


return item;

}
          
          
function Validate(pole, ships)
{
  let sum = 0
  let kletki = 0
  console.log("Начало проверки")
  for(let i=0; i<pole.length; i++) {
    for(let b=0; b<pole[i].length; b++) {
      if(pole[i][b] == 1) {
        NeighborsValidate(pole, i, b)
        kletki ++;
        }
    }
  }
  ShipsValidate(pole, ships)
  console.log("Проверка закончена")
  console.log("Количество клеток: " + kletki)
  console.log(ships)

}
        
function NeighborsValidate(pole, x, y) {
let sum = 0
// console.log("Координата клетки: " + x + "-" + y)
if (x == 0 && y == 0) {
  sum = pole[x+1][y] + pole[x][y+1] + pole [x+1][y+1]
  // console.log("Количество соседних клеток: " + sum)
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
  sum = pole[x+1][y] + pole [x][y-1] + pole [x+1][y-1]
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
  sum = pole[x-1][y] + pole [x][y+1] + pole[x-1][y+1]
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
  sum = pole[x-1][y] + pole [x][y-1] + pole [x-1][y-1]
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

function ShipsValidate(pole, ships) {
let validatePole = [...pole]
// ships.korda_x = 1
// ships.korda_y = 2
// console.log(ships)
let ships_count = 0

for(let i=0; i<validatePole.length; i++) {
  for(let b=0; b<validatePole[0].length; b++) {
    // console.log(pole[i][b])
    if(validatePole[i][b] == 1) {
      // validatePole[i][b] = 2
      let dlina = 1;
      let count = 1;
      let obj = {}
      if(b != 9) {
        if(validatePole[i][b+count] == 1) {
            while (validatePole[i][b+count] == 1) {
              // validatePole[i][b+count] = 2
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
          ships_count += 1

          obj.dlina = dlina
          obj.x = b
          obj.y = i
        console.log("Корабль: " + i + " " + b + " " + "Длина: " + dlina)
        console.log(obj)
        // console.log("Длина: " + dlina) 
        }
      }
      if(i != 9) {
        if(validatePole[i+count][b] == 1) {
          while (validatePole[i+count][b] == 1) {
            // validatePole[i+count][b] = 2
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
        ships[ships_count].korda_x = i
        ships[ships_count].korda_y = b
        ships[ships_count].size = dlina
        ships_count += 1
        console.log("Корабль: " + i + " " + b + " " + "Длина: " + dlina)
        }
      }
    

  }
}
}
// let dlina = 1;
// let count = 1;

// if(pole[y][x+1] == 1) {
//   dlina += 1;
//   x += 1;
//   while(pole[y][x+1] == 1) {
//     dlina += 1;
//     x += 1; 
//   }
// }

// console.log(x, y)

// console.log(dlina)
}



function RebootGame() {
let restart_text = document.querySelector(".restart_text")
let restart_btn = document.querySelector(".restart_button")
console.log("Неверная растановка кораблей")
restart_text.classList.remove("none")
restart_btn.classList.remove("none")
console.log(restart_text, restart_btn)
}


// pole.addEventListener(click,function(){
//   if(item=1){
//     item.classList.add("hit")
//   }
//   else{
//     item.classList.add("miss")
//   }
// }
// )











// let array = [
//   {
//     item:game_item,
//     x : x,
//     y : y
//   }

// ]
// let arrayCell=array.find(el =>el.x     item.x && el.y   item.y)

