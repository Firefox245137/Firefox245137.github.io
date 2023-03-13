uniqueId = 'id-'+Math.random().toString(36).substr(2, 16)
let realtime = new Ably.Realtime.Promise({
    key: '_DozwA.-SQREA:-Oq0lof0G-qfMn2cJudgLZDKpgxyyG3ElSGWw-6zwT4',
    clientId: uniqueId }
);

function getMembers(channel){
    let len;
    channel.presence.get((err, members) => {
        if (err) {
            console.error('Unable to get Presence members:', err);
            return;
        }
        if(members.length>2)
            location.replace('../waiting.html');
        console.log(`There are ${members.length} members currently in the channel.`);
        console.log('Members: ' + members);
        // let msgstr = members.length == 1 ? "is 1 person" : "are "+members.length+" people";
        // document.getElementById("message").innerHTML = "There " + msgstr + " on this website right now!";
        len = members.length;
    });
    return len;
}

async function doPubSub() {
    await realtime.connection.once("connected");
    let myTurn = false;
    let channel = realtime.channels.get('DaChannel');
    console.log("Connected to Ably!");

    await channel.subscribe('click', (msg) => {
        if(msg.clientId != uniqueId){
            let intermediary = {specialAbly: true, x: msg.data.col, y: 0};
            myTurn = !myTurn;
            clickFunc(intermediary);
        }
    });
    await channel.presence.subscribe('enter', (member) => {
        console.log(`User ${member.clientId} has entered the channel.`);
        let numPlayers = getMembers(channel);
        console.log("players: " + numPlayers);
        if(member.clientId!=uniqueId){
            myTurn = true;
            let elements = document.getElementsByClassName('player');
            for(let i=0; i<elements.length; i++){
                elements[i].innerHTML = "Red";
                elements[i].style.color = "red"; 
            }
            document.getElementById("wait").hidden = true;
            document.getElementById("play").hidden = false;
        }else if(numPlayers==2){
            let elements = document.getElementsByClassName('player');
            for(let i=0; i<elements.length; i++){
                elements[i].innerHTML = "Yellow";
                elements[i].style.color = "yellow"; 
            }
            document.getElementById("spanturn").innerHTML = "Red";
            document.getElementById("spanturn").style.color = "red";
            document.getElementById("wait").hidden = true;
            document.getElementById("play").hidden = false;
        }
    });
    await channel.presence.enter();
    await channel.presence.subscribe('leave', (member) => {
        console.log(`User ${member.clientId} has left the channel.`);
        getMembers(channel);
        reset(true);
    });

    PIXI.utils.sayHello();
    const Sprite = PIXI.Sprite;
    const loader = PIXI.Loader.shared;
    const TextureCache = PIXI.utils.TextureCache;
    const Graphics = PIXI.Graphics;
    const Container = PIXI.Container;

    let board = [], turnedOn = [];
    let gridSizeX = 7, gridSizeY = 6, gridPx = 60;
    let redTurn = true, win = 0;
    let flash, bg;

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

        bg = new Graphics();
        bg.lineStyle({width: 1, color: 0x000000, alpha: 1});
        bg.beginFill(0x0000FF);
        bg.drawRect(1, 0, app.renderer.width-1, app.renderer.height);
        bg.endFill();
        gameScene.addChild(bg);
        flash = new Graphics();
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

        app.ticker.add(gameLoop);
    }

    function clickFunc(e){
        if(win > 0 || !myTurn)
            return;
        let x, y;
        if(e.specialAbly!=null){
            x = e.x;
            y = e.y;
        }else{
            x = Math.floor(e.data.global.x/gridPx);
            y = Math.floor(e.data.global.y/gridPx);
        }
        let pos = y*gridSizeX + x;
        if(turnedOn[pos] > 0)
            return;
        for(; pos<gridSizeX*gridSizeY - gridSizeX; pos+=gridSizeX, y++){
            if(turnedOn[pos+gridSizeX] > 0)
                break;
        }
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
        let toStr = (redTurn) ? "Red" : "Yellow";
        document.getElementById("spanturn").innerHTML = toStr;
        document.getElementById("spanturn").style.color = toStr.toLowerCase();
        if(e.specialAbly==null){
            myTurn = !myTurn;
            channel.publish('click', {col: x});
        }
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
    function gameLoop(){
        if(++frameTicker%6!=0)
            return;
        frameTicker = frameTicker%6;
        if(win > 0){
            gameOver.visible = !gameOver.visible;
            document.getElementById("divturn").hidden = true;
            document.getElementById("win").hidden = false;
            let toStr = (!redTurn) ? "Red" : "Yellow";
            document.getElementById("winner").innerHTML = toStr;
            document.getElementById("winner").style.color = toStr.toLowerCase();
        }

    }

    function reset(leaver){
        for(i=0; i<gridSizeX*gridSizeY; i++){
            gameScene.removeChild(board[i]);
        }
        gameScene.removeChild(bg);
        gameOver.removeChild(flash);
        gameOver.visible = false;
        gameScene.visible = true;
        win = 0;
        frameTicker = -1;
        app.ticker.remove(gameLoop);
        myTurn = (myTurn && redTurn) || (!myTurn && !redTurn) ? true : false;
        redTurn = true;
        document.getElementById("spanturn").innerHTML = "Red";
        document.getElementById("spanturn").style.color = "red";
        document.getElementById("divturn").hidden = false;
        document.getElementById("win").hidden = true;
        if(leaver){
            document.getElementById("play").hidden = true;
            document.getElementById("wait").hidden = false;
            myTurn = false;
        }
        board = [];
        turnedOn = [];
        loader
            .load(setup);
    }

    channel.subscribe("reset", (msg)=>{
        reset(false);
    });
    document.getElementById("resetbutton").addEventListener("click", function(){
        if(document.getElementById("play").hidden)
            return;
        channel.publish("reset", null);
    });
    



}

doPubSub();