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
      item.style.background = "rgb(216, 222, 233)"
      pole[y-1][x-1] = 0

            }
            console.log(pole)
            })
            }
            
            
            return item;
            
            }
            
            
            // function countOfNeighbors(pole, x, y) {
              //   let sum = 0;
              
              //   if(x == 0  && y == 0) {
                //       sum = pole[x+1][y] + pole[x][y+1] + pole[x+1][y+1]
                //       return sum;
                //   }
                //   else if(x == 0  && y == 9) {
                  //       sum = pole[x+1][y] + pole[x][y-1] + pole[x+1][y-1]
                  //       return sum;
                  //   }
                  //   else if(x == 9  && y == 0) {
                    //       sum = pole[x-1][y] + pole[x][y+1] + pole[x-1][y+1]
                    //       return sum;
                    
                    //   }
                    //   else if(x == 9  && y == 9) {
                      //       sum = pole[x-1][y] + pole[x][y-1] + pole[x-1][y-1]
//       return sum;
//   }

//   if(x == 0) {
  //       sum = pole[x][y-1] + pole[x+1][y-1] + pole[x+1][y] + pole[x][y+1] + pole[x+1][y+1]
  //       return sum;
  //   }
  //   if(x == 9) {
    //       sum = pole[x-1][y-1] + pole[x][y-1] + pole[x-1][y] + pole[x-1][y+1] + pole[x][y+1]
    //       return sum;
    //   }
    //   if(y == 0) {
      //       sum = pole[x-1][y] + pole[x+1][y] + pole[x-1][y+1] + pole[x][y+1] + pole[x+1][y+1]
      //       return sum;
      //   }
      //   if(y == 9) {
//       sum= pole[x-1][y-1] + pole[x][y-1] + pole[x+1][y-1] + pole[x-1][y] + pole[x+1][y]
//       return sum;
//   }

//   sum =  pole[x-1][y-1] + pole[x][y-1] + pole[x+1][y-1] +
//             pole[x-1][y] +                  pole[x+1][y] +
//             pole[x-1][y+1] + pole[x][y+1] + pole[x+1][y+1]

//   return sum;
// }
function Validate(pole)
{
    let sum = 0
    let kletki = 0
    // console.log("Начало проверки")
    for(let i=0; i<pole.length; i++) {
      for(let b=0; b<pole[i].length; b++) {
        if(pole[i][b] == 1) {
          NeighborsValidate(pole, i, b)
          ShipsValidate(pole, i, b)
          kletki ++;
        }
      }
    }
    // console.log("Количество клеток: " + kletki)


    
    
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

function ShipsValidate(pole, x, y) {
  // Определяем ориентацию корабля: гей или лезби
  for(let i=0; i<pole.length; i++) {
    for(let b=0; b<pole[0].length; b++) {
      if(pole[i][b] == 1) {
        let dlina = 1;
        let count = 1;
        while (pole[i][b+count] == 1) {
          dlina += 1;
          count += 1;
        }
        if(pole[i][b-1] == 1) {
          continue;
        }
        console.log("Корабль: " + i + " " + b)
        console.log("Длина: " + dlina)  
      } 

        // && pole[i][b+1] == 1) {
    }
  }
  // if(pole[x+1][y] == 1 || pole[x-1][y] == 1) {
  //   VerticalShipAdd(pole, x, y)
  // }
  // if(pole[x][y+1] == 1 || pole[x][y-1] == 1) {
  //   HorizontalShipAdd(pole, x, y)
  // }
}

function HorizontalShipAdd(pole, x, y) {
  let ShipLength = 0
  console.log("Ориентация корабля горизонтальная")
  for(t = -3; t<=3; t++)
    {
      if(pole[x+t][y] == 1) 
      {
        ShipLength += 1
      }
    }
  

  console.log(ShipLength)

}

function VerticalShipAdd(pole, x, y) {
  console.log("Ориентация корабля вертикальная")
}

function RebootGame() {
  let restart_text = document.querySelector(".restart_text")
  let restart_btn = document.querySelector(".restart_button")
  console.log("Неверная растановка кораблей")
  restart_text.classList.remove("none")
  restart_btn.classList.remove("none")
  console.log(restart_text, restart_btn)
}
pole.addEventListener(click,function(){
  if(item=1){
    item.classList.add("hit")
  }
  else{
    item.classList.add("miss")
  }
}
)
