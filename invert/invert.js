PIXI.utils.sayHello();
const Sprite = PIXI.Sprite;
const loader = PIXI.Loader.shared;
const TextureCache = PIXI.utils.TextureCache;
const Graphics = PIXI.Graphics;
const Container = PIXI.Container;

const app = new PIXI.Application({width: 601, height: 601});
document.body.appendChild(app.view);
let gameScene = new Container();
app.stage.addChild(gameScene);
let gameOver = new Container();
app.stage.addChild(gameOver);
gameOver.visible = false;

let currdate = new Date();
let seed = currdate.getTime();
let seedCalled = 0;
function random(){
    seedCalled++;
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


let board = [], turnedOn = [];
let gridSize = 10, gridPx = 600/gridSize, spams = 25;
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
        gameScene.addChild(board[i]);
    }
    
    for(i=0; i<spams; i++){
        let sx = Math.floor(random() * gridSize);
        let sy = Math.floor(random() * gridSize);
        clickIntermediate(sx, sy);
    }

    const style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white",
      });
    message = new PIXI.Text("You win!", style);
    message.x = app.stage.width / 2 - message.width/2;
    message.y = app.stage.height / 2 - 32;
    gameOver.addChild(message);
    
    app.ticker.add((delta) => gameLoop(delta));
}

function clickIntermediate(x, y){
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

function clickFunc(e){
    console.log('Mouse clicked ');
    console.log('X', e.data.global.x, 'Y', e.data.global.y);
    let x = Math.floor(e.data.global.x/gridPx);
    let y = Math.floor(e.data.global.y/gridPx);
    clickIntermediate(x, y);
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
    // console.log(turnedOn);
    let win = true;
    for(i=0; i<turnedOn.length; i++){
        if(turnedOn[i]==true){
            win = false;
            break;
        }
    }
    if(win){
        gameScene.visible = false;
        gameOver.visible = true;
    }
}

function reset(randomize){
    gameOver.visible = false;
    gameScene.visible = true;
    for(i=0; i<gridSize*gridSize; i++){
        gameScene.removeChild(board[i]);
    }
    if(!randomize)
        seed -= seedCalled;
    seedCalled = 0;
    board = [];
    turnedOn = [];
    loader
        .load(setup);
}


