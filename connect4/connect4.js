PIXI.utils.sayHello();
const Sprite = PIXI.Sprite;
const loader = PIXI.Loader.shared;
const TextureCache = PIXI.utils.TextureCache;
const Graphics = PIXI.Graphics;
const Container = PIXI.Container;



let currdate = new Date();
let seed = currdate.getTime();
function random(){
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

let board = [], turnedOn = [];
let gridSizeX = 7, gridSizeY = 6, gridPx = 60;
let redTurn = true, win = 0;

const app = new PIXI.Application({width: gridSizeX*gridPx + 1, height: gridSizeY*gridPx + 1});
let gameScene = new Container();
app.stage.addChild(gameScene);
let gameOver = new Container();
app.stage.addChild(gameOver);
gameOver.visible = false;


document.body.appendChild(app.view);

loader
  .load(setup);

function setup(){   

    let bg = new Graphics();
    bg.lineStyle({width: 1, color: 0x000000, alpha: 1});
    bg.beginFill(0x0000FF);
    bg.drawRect(1, 0, app.renderer.width-1, app.renderer.height);
    bg.endFill();
    gameScene.addChild(bg);
    let flash = new Graphics();
    flash.lineStyle({width: 1, color: 0x000000, alpha: 1});
    flash.beginFill(0x000000);
    flash.drawRect(1, 0, app.renderer.width-1, app.renderer.height);
    flash.endFill();
    flash.alpha = .5;
    gameOver.addChild(flash);
    for(i=0; i<gridSizeX*gridSizeY; i++){
        board.push(new Graphics());
        turnedOn.push(0);
        // console.log(board);
        board[i].lineStyle({width: 1, color: 0x000000, alpha: 1});
        board[i].beginFill(0xFFFFFF);
        let tX = i%gridSizeX, tY = Math.floor(i/gridSizeX);
        board[i].drawCircle(tX*gridPx + 1 + gridPx/2, tY*gridPx + gridPx/2, gridPx/2);
        board[i].endFill();
        board[i].interactive = true;
        board[i].on('mousedown', clickFunc);
        gameScene.addChild(board[i]);
    }

    app.ticker.add((delta) => gameLoop(delta));
}

function clickFunc(e){
    
    // console.log('Mouse clicked ');
    // console.log('X', e.data.global.x, 'Y', e.data.global.y);
    let x = Math.floor(e.data.global.x/gridPx);
    let y = Math.floor(e.data.global.y/gridPx);
    let pos = y*gridSizeX + x;
    if(turnedOn[pos] > 0)
        return;
    for(; pos<gridSizeX*gridSizeY - gridSizeX; pos+=gridSizeX, y++){
        if(turnedOn[pos+gridSizeX] > 0)
            break;
    }
    // console.log('X', x, 'Y', y);
    // console.log(x*gridPx, y*gridPx);
    let color;
    if(redTurn){
        color = 0xFF0000;
        turnedOn[pos] = 1;
    }else{
        color = 0xECFF1F;
        turnedOn[pos] = 2;
    }
    board[pos].beginFill(color);
    board[pos].drawCircle(x*gridPx + 1 + gridPx/2, y*gridPx + gridPx/2, gridPx/2);
    board[pos].endFill();
    win = checkWin(x, y);
    redTurn = !redTurn;
}

function checkWin(x, y){
    console.log("x:", x, "y:", y);
    let turn = (redTurn) ? 1 : 2;
    console.log(turn);
    let biggestStreak = 1;
    for(i=x-1; i>-1; i--)
        if(turnedOn[y*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    for(i=x+1; i<gridSizeX; i++)
        if(turnedOn[y*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    if(biggestStreak >= 4)
        return turn;
    biggestStreak = 1;
    for(i=y-1; i>-1; i--)
        if(turnedOn[i*gridSizeY + x]==turn)
            biggestStreak++;
        else
            break;
    for(i=y+1; i<gridSizeY; i++)
        if(turnedOn[i*gridSizeX + x]==turn)
            biggestStreak++;
        else
            break;
    if(biggestStreak >= 4)
        return turn;
    biggestStreak = 1;
    for(i=x-1, j=y-1; i>-1 && j>-1; i--, j--)
        if(turnedOn[j*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    for(i=x+1, j=y+1; i<gridSizeX && j<gridSizeY; i++, j++)
        if(turnedOn[j*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    if(biggestStreak >= 4)
        return turn;
    biggestStreak = 1;
    for(i=x-1, j=y+1; i>-1 && j<gridSizeY; i--, j++)
        if(turnedOn[j*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    for(i=x+1, j=y-1; i<gridSizeX && j>-1; i++, j--)
        if(turnedOn[j*gridSizeX + i]==turn)
            biggestStreak++;
        else
            break;
    if(biggestStreak >= 4)
        return turn;
    return 0;      
}

let frameTicker = -1;
function gameLoop(delta){
    if(++frameTicker%6!=0)
        return;
    frameTicker = frameTicker%6;
    if(win > 0){
        gameOver.visible = !gameOver.visible;
    }

}

function reset(){
    for(i=0; i<gridSizeX*gridSizeY; i++){
        gameScene.removeChild(board[i]);
    }
    gameOver.visible = false;
    gameScene.visible = true;
    win = 0;
    frameTicker = -1;
    redTurn = true;
    board = [];
    turnedOn = [];
    loader
        .load(setup);
}


