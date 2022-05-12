PIXI.utils.sayHello();
const Sprite = PIXI.Sprite;
const loader = PIXI.Loader.shared;
const TextureCache = PIXI.utils.TextureCache;
const Graphics = PIXI.Graphics;

const app = new PIXI.Application({width: 601, height: 601});


document.body.appendChild(app.view);


let board = [], turnedOn = [];
let gridSize = 10, gridPx = 600/gridSize;
let animate = false;

loader
  .load(setup);

function setup(){    
    for(i=0; i<gridSize*gridSize; i++){
        board.push(new Graphics());
        turnedOn.push(false);
        // console.log(board);
        board[i].lineStyle({width: 1, color: 0x000000, alpha: 1});
        board[i].beginFill(0xFFFFFF);
        let tX = i%gridSize, tY = Math.floor(i/gridSize);
        board[i].drawRect(tX*gridPx + 1, tY*gridPx, gridPx, gridPx);
        board[i].endFill();
        board[i].interactive = true;
        board[i].on('mousedown', clickFunc);
        app.stage.addChild(board[i]);
    }

    
    app.ticker.add((delta) => gameLoop(delta));
}

function clickFunc(e){
    console.log('Mouse clicked ');
    console.log('X', e.data.global.x, 'Y', e.data.global.y);
    let x = Math.floor(e.data.global.x/gridPx);
    let y = Math.floor(e.data.global.y/gridPx);
    swap(x, y);
    if(x > 0)
        swap(x-1, y);
    if(y > 0)
        swap(x, y-1);
    if(x < gridSize-1)
        swap(x+1, y);
    if(y < gridSize-1)
        swap(x, y+1);
}

function swap(x, y){
    let color;
    if(turnedOn[y*gridSize + x]){
        color = 0xFFFFFF;
        turnedOn[y*gridSize + x] = false;
    }else{
        color = 0x000000;
        turnedOn[y*gridSize + x] = true;
    }
    console.log('X', x, 'Y', y);
    console.log(x*gridPx, y*gridPx);
    board[y*gridSize + x].beginFill(color);
    board[y*gridSize + x].drawRect(x*gridPx + 1, y*gridPx, gridPx, gridPx);
    board[y*gridSize + x].endFill();
}


function gameLoop(delta){
    // if(animate){
    //     let x = Math.floor(Math.random()*10), y = Math.floor(Math.random()*10);
    //     board[y*gridSize + x].beginFill(Math.floor(Math.random() * 0xFFFFFF));
    //     board[y*gridSize + x].drawRect(x*gridPx, y*gridPx, gridPx, gridPx);
    //     board[y*gridSize + x].endFill();
    // }   
}

function reset(){
    for(i=0; i<gridSize*gridSize; i++){
        app.stage.removeChild(board[i]);
    }
    board = [];
    turnedOn = [];
    loader
        .load(setup);
}


