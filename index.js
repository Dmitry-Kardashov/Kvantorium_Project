document.addEventListener("DOMContentLoaded", function() {
    // let input = document.querySelector(".input-count")
        let startBtn = document.querySelector(".start-game")
        startBtn.addEventListener("click", function() {
         startGame ()
        
        })
    
     })
        

    function startGame (count) {
    let container = document.createElement("div")
    container.classList.add("game")
    // let pole = []
    let pole = createShufflePole (count)
    
    for(let i=0; i<pole.length; i++) {
    for(let b=0; b<pole [0].length; b++) {
    let item = createItem(pole, i, b, pole[i][b])
      container.append(item)
    
    }
    
  }
    
    console.log(container)
    
    document.body.append(container)
}

function createShufflePole (count) {
    let pole = []
    for(let i=0; i< 10; i++) {
        pole.push(new Array())
        for(let b=0; b<10; b++) {
              pole[i][b] = 0
    
    }
    
  }
    console.log(pole)
    return pole
      
   } 

function createItem(pole, x, y, isMine) {
    let item = document.createElement("div")
    item.classList.add("game_item")

//     item.addEventListener("click", function() {
//     item.style.background = "rgb(0, 0, 0)"
// })

return item;

}