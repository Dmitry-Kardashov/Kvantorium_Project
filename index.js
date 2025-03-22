document.addEventListener("DOMContentLoaded", function() {
    // let input = document.querySelector(".input-count")
        let startBtn = document.querySelector(".start-game")
        startBtn.addEventListener("click", function() {
         startGame()


         let pole_text = document.querySelector(".polya")
         pole_text.classList.remove("none")
         let pole_knopka = document.querySelector(".save-button")
         pole_knopka.classList.remove("none")
        })
    
     })
        

    function startGame() {
    let container = document.createElement("div")
    container.classList.add("game")
    let container1 = document.createElement("div")
    container1.classList.add("game")
    // let pole = []
    let pole = createShufflePole()
    console.log(pole)

    for(let i=0; i<pole.length; i++) {
      for(let b=0; b<pole[i].length; b++) {
        let item = createItem(pole, pole[i][b], i, b)
        container.append(item)
      }
    }

    for(let i=0; i<pole.length; i++) {
      for(let b=0; b<pole[i].length; b++) {
        let item = createItem(pole, pole[i][b], i, b)
        container1.append(item)
      }
    }
    
    
    let container2 = document.querySelector(".container")
    container2.append(container)
    container2.append(container1)

    pole.splice(0, 1)
    pole.forEach(el => el.splice(0, 1))

    console.log(pole)

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


function validatePole() {

}