PIXI.utils.sayHello();
const Sprite = PIXI.Sprite;
const loader = PIXI.Loader.shared;
const TextureCache = PIXI.utils.TextureCache;
const Graphics = PIXI.Graphics;
const Container = PIXI.Container;

let currdate = new Date();
let seed = currdate.getTime();
let seedCalled = 0;
function random(){
    seedCalled++;
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var sound = new Howl({
    src: ['pickupApple.wav']
});
  
let style = new PIXI.TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white",
});

let board = [], player = [], apple, direction = 'S';
let gridPx = 30, gridSize = 21;
let playerX = [Math.floor(gridSize/2)], playerY = [playerX];
let appleX = 0, appleY = 0;
let endCheck = false, beginning = true;
let score = 0, message = new PIXI.Text("Game Over\nScore: 1", style);;
let dirBuffer = [];
const up = keyboard("ArrowUp"), down = keyboard("ArrowDown"), left = keyboard("ArrowLeft"), right = keyboard("ArrowRight");
up.press = () =>{
    if(player.length==1 || direction!='D' || (dirBuffer.length > 0 && dirBuffer[dirBuffer.length-1]!='D'))
        dirBuffer.push('U');
};
down.press = () =>{
    if(player.length==1 || direction!='U' || (dirBuffer.length > 0 && dirBuffer[dirBuffer.length-1]!='U'))
        dirBuffer.push('D');
};
left.press = () =>{
    if(player.length==1 || direction!='R' || (dirBuffer.length > 0 && dirBuffer[dirBuffer.length-1]!='R'))
        dirBuffer.push('L');
};
right.press = () =>{
    if(player.length==1 || direction!='L' || (dirBuffer.length > 0 && dirBuffer[dirBuffer.length-1]!='L'))
        dirBuffer.push('R');
};


const app = new PIXI.Application({width: gridPx*gridSize + 1, height: gridPx*gridSize + 1});
document.body.appendChild(app.view);
let gameScene = new Container();
app.stage.addChild(gameScene);
let gameOver = new Container();
app.stage.addChild(gameOver);
gameOver.visible = false;




loader
  .load(setup);

function setup(){    
    app.renderer.backgroundColor = 0xFFFFFF;
    style.fontSize = app.renderer.height/8;
    for(i=0; i<gridSize+1; i++){
        board.push(new Graphics());
        board[i].lineStyle({width: 1, color: 0x000000, alpha: 1});
        board[i].moveTo(0, 0);
        board[i].lineTo(0, app.renderer.width);
        board[i].x = i*gridPx + 1;
        gameScene.addChild(board[i]);
    }
    for(i=0; i<gridSize+1; i++){
        board.push(new Graphics());
        board[board.length-1].lineStyle({width: 1, color: 0x000000, alpha: 1});
        board[board.length-1].moveTo(0, 0);
        board[board.length-1].lineTo(app.renderer.height, 0);
        board[board.length-1].y = i*gridPx;
        gameScene.addChild(board[board.length-1]);
    }

    //Define player
    player.push(new Graphics());
    player[0].beginFill(0x000000);
    player[0].drawRect(1, 0, gridPx, gridPx);
    player[0].endFill();
    player[0].x = playerX[0] * gridPx;
    player[0].y = playerY[0] * gridPx;
    gameScene.addChild(player[0]);

    //Define apple
    apple = new Graphics();
    apple.lineStyle({width: 1, color: 0x000000, alpha: 1});
    apple.beginFill(0xFF0000);
    apple.drawRect(1, 0, gridPx, gridPx);
    apple.endFill();
    moveApple();
    gameScene.addChild(apple);

    //Game over message
    message.text = "Game Over\nScore: 1";
    message.x = app.stage.width / 2 - message.width/2;
    message.y = app.stage.height / 2 - message.height/2;
    gameOver.addChild(message);
    
    app.ticker.add(gameLoop);
}

//Moves the apple to a non-player square
function moveApple(){
    sound.play();
    let check;
    do{
        check = false;
        appleX = Math.floor(random()*gridSize);
        appleY = Math.floor(random()*gridSize);
        for(i=0; i<playerX.length; i++){
            if(appleX==playerX[i] && appleY==playerY[i]){
                check = true;
                break;
            }
        }
    }while(check);
    apple.x = appleX*gridPx;
    apple.y = appleY*gridPx;
}

//Happens every frame
//Think of it as an 'update()' function
let frameTicker = 0;
function gameLoop(){
    if(endCheck){
        app.renderer.backgroundColor = 0x000000;
        gameScene.visible = false;
        gameOver.visible = true;
    }else{
        if(++frameTicker%6!=0)
            return;
        frameTicker = 0;
        if(dirBuffer.length > 0){
            direction = dirBuffer[0];
            if(dirBuffer.length > 1)
                dirBuffer = dirBuffer.slice(1, dirBuffer.length);
            else
                dirBuffer = [];       
        }
        adjustPos();
    }
    
}

//Moves the player in accordance to the specified direction
function adjustPos(){
    if(direction=='S')
        return;
    let lastX = playerX[playerX.length-1], lastY = playerY[playerY.length-1];
    for(i=player.length-1; i>0; i--){
        playerX[i] = playerX[i-1];
        playerY[i] = playerY[i-1];
    }
    switch(direction){
        case 'U':
            playerY[0]--;
            break;
        case 'D':
            playerY[0]++;
            break;
        case 'R':
            playerX[0]++;
            break;
        case 'L':
            playerX[0]--;
            break;
    }
    for(i=0; i<player.length; i++){
        player[i].x = playerX[i]*gridPx;
        player[i].y = playerY[i]*gridPx;
    }
    if(playerX[0]==appleX && playerY[0]==appleY){
        score++;
        message.text = "Game Over\nScore: " + (score+1);
        message.x = app.stage.width / 2 - message.width/2;
        message.y = app.stage.height / 2 - message.height/2;
        moveApple();
        player.push(new Graphics());
        player[player.length-1].beginFill(0x000000);
        player[player.length-1].drawRect(1, 0, gridPx, gridPx);
        player[player.length-1].endFill();
        player[player.length-1].x = -1000;
        player[player.length-1].y = -1000;
        gameScene.addChild(player[player.length-1]);
        playerX.push(lastX);
        playerY.push(lastY);

    }
    if(playerX[0] >= gridSize || playerX[0] < 0 || playerY[0] >= gridSize || playerY[0] < 0 || checkSelfKill())
        endCheck = true;
}

function checkSelfKill(){
    for(i=1; i<playerX.length; i++){
        if(playerX[0]==playerX[i] && playerY[0]==playerY[i])
            return true;
    }
    return false;
}

function reset(){
    console.log("reset");
    gameOver.visible = false;
    gameScene.visible = true;
    endCheck = false;
    for(i=0; i<board.length; i++)
        gameScene.removeChild(board[i]);
    gameOver.removeChild(message);
    for(i=0; i<player.length; i++)
        gameScene.removeChild(player[i]);
    gameScene.removeChild(apple);
    playerX = [];
    playerY = [];
    player = [];
    playerX[0] = Math.floor(gridSize/2);
    playerY[0] = playerX[0];
    app.ticker.remove(gameLoop);
    seedCalled = 0;
    frameTicker = 0;
    score = 0;
    direction = 'S';
    dirBuffer = [];
    board = [];
    turnedOn = [];
    loader
        .load(setup);
}

function changeGridSize(size, px){
    gridSize = Number(size);
    gridPx = Number(px);
    app.renderer.autoDensity = true;
    app.renderer.resize(gridSize*gridPx + 1, gridSize*gridPx + 1);
    reset();
}


function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
  }