PIXI.utils.sayHello();
const Sprite = PIXI.Sprite;
const loader = PIXI.Loader.shared;
const TextureCache = PIXI.utils.TextureCache;
const Graphics = PIXI.Graphics;

const app = new PIXI.Application({width: 900, height: 500});

let seed = 100;
let seedCalled = 0;
function random(){
    seedCalled++;
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

document.body.appendChild(app.view);
const WIDTH = 900
let towers = [[], [], []], ether = 0
let discs = []
let numDiscs = 5, discWidth = 50, discHeight = 30
let HEIGHT = 250 + discHeight*numDiscs
let win = false

let style = new PIXI.TextStyle({
    fontFamily: "Futura",
    fontSize: 20,
    fill: "black",
});
let message = new PIXI.Text("Moves: 0\nMinimum Moves: " + (Math.pow(2, numDiscs))-1, style);
let winMsg = new PIXI.Text("You Win!", style)
let numMoves = 0, lastTower = 0

loader
  .load(setup);

function setup(){  
    

    console.log(towers)
    app.renderer.autoDensity = true;
    app.renderer.resize(WIDTH, HEIGHT);  
    let temp = new Graphics();
    temp.lineStyle({width: 1, color: 0x000000, alpha: 1});
    temp.beginFill(0xFFFFFF);
    temp.drawRect(1, 0, WIDTH-1, HEIGHT-1);
    temp.interactive = true
    temp.on('mousedown', clickFunc);
    temp.endFill();
    app.stage.addChild(temp);
    for(i=0; i<3; i++){
        let tower = new Graphics()
        tower.beginFill(0x000000)
        tower.drawRect(i*WIDTH/3 + WIDTH/6 - 5, 150, 10, HEIGHT-150)
        tower.endFill()
        app.stage.addChild(tower)
    }
    if(numDiscs > 6)
        discWidth = 300/numDiscs
    else
        discWidth = 50
    for(i=0; i<numDiscs; i++){
        towers[0].push(numDiscs-i)
        discs.push(new Graphics())
        discs[i].lineStyle({width: 1, color: 0x000000, alpha: 1}); 
        discs[i].beginFill(Math.floor(random() * 0xFFFFFF))
        discs[i].drawRoundedRect(0,0, discWidth*(i+1), discHeight, 20)
        discs[i].endFill()
        app.stage.addChild(discs[i])
        discs[i].x = WIDTH/6 - discWidth*(i+1)/2,
        discs[i].y = HEIGHT - (numDiscs-i)*discHeight - 1
    }
    message.x = 0
    message.y = 0
    message.text = "Moves: 0\nMinimum Moves: " + (Math.pow(2, numDiscs) - 1)
    app.stage.addChild(message)
    winMsg.x = WIDTH - winMsg.width
    winMsg.y = 0
    winMsg.visible = false
    app.stage.addChild(winMsg)
    // app.ticker.add(gameLoop);
}

function clickFunc(e){
    if(win)
        return
    console.log('Mouse clicked ');
    console.log('X', e.data.global.x, 'Y', e.data.global.y);
    let x = Math.floor(e.data.global.x);
    let y = Math.floor(e.data.global.y);
    console.log('X', x, 'Y', y);
    if(x < WIDTH/3){
        moveDisc(0)
    }else if(x < 2*WIDTH/3){
        moveDisc(1)
    }else{
        moveDisc(2)
    }
    if(checkWin()){
        win = true
        winMsg.visible = true
    }
}

function moveDisc(towerNum){
    tHeight = towers[towerNum].length
    console.log(tHeight)
    if(ether==0){
        if(tHeight==0)
            return
        ether = towers[towerNum].pop()
        discs[ether-1].y = 75 
        lastTower = towerNum
    }else{
        if(tHeight!=0 && towers[towerNum][tHeight-1] < ether)
            return
        discs[ether-1].x = towerNum*WIDTH/3 + WIDTH/6 - discs[ether-1].width/2
        discs[ether-1].y = HEIGHT - (tHeight+1)*discHeight - 1
        towers[towerNum].push(ether)
        console.log(discs[ether-1].x, discs[ether-1].y)
        ether = 0
        if(towerNum!=lastTower){
            numMoves++
            message.text = "Moves: " + numMoves + "\nMinimum Moves: " + ((Math.pow(2, numDiscs))-1)
        }
        lastTower = towerNum
    }
    return
}


function gameLoop(){
    // return
}

function checkWin(){
    if(towers[2].length!=numDiscs)
        return false
    return true
}

function reset(){
    // app.ticker.remove(gameLoop);
    towers = [[], [], []];
    ether = 0;
    discs = [];
    lastTower = 0
    win = false
    numMoves = 0
    HEIGHT = 250 + discHeight*numDiscs
    message.text = ("Moves: 0\nMinimum Moves: " + (Math.pow(2, numDiscs))-1)
    loader
        .load(setup);
}

function changeDiscs(num){
    numDiscs = num;
    reset();
}


