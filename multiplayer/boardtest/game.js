uniqueId = 'id-'+Math.random().toString(36).substr(2, 16)
let realtime = new Ably.Realtime.Promise({
    key: '_DozwA.-SQREA:-Oq0lof0G-qfMn2cJudgLZDKpgxyyG3ElSGWw-6zwT4',
    clientId: uniqueId }
);

function getMembers(channel){
    channel.presence.get((err, members) => {
        if (err) {
            console.error('Unable to get Presence members:', err);
            return;
        }
        if(uniqueId==members[0].clientId)
            channel.publish('syncboard', historySync)
        console.log(`There are ${members.length} members currently in the channel.`);
        console.log('Members: ' + members);
        let msgstr = members.length == 1 ? "is 1 person" : "are "+members.length+" people";
        document.getElementById("message").innerHTML = "There " + msgstr + " on this website right now!";
    });
}

async function doPubSub() {
    await realtime.connection.once("connected");
    historySync = [[],[],[]]
    let channel = realtime.channels.get('big-zoo-all');
    console.log("Connected to Ably!");

    await channel.subscribe('click', (msg) => {
        // if(msg.data.id != uniqueId){
        let y = msg.data.y, x = msg.data.x, randcolor = msg.data.c;
        historySync[0].push(y);
        historySync[1].push(x);
        historySync[2].push(randcolor);
        board[y*gridSize + x].beginFill(randcolor);
        board[y*gridSize + x].drawRect(x*gridPx + 1, y*gridPx, gridPx, gridPx);
        board[y*gridSize + x].endFill();
    });
    await channel.subscribe('syncboard', (msg) =>{
        historySync = msg.data;
        for(let i=0; i<msg.data[0].length; i++){
            let y = msg.data[0][i], x = msg.data[1][i], randcolor = msg.data[2][i];
            board[y*gridSize + x].beginFill(randcolor);
            board[y*gridSize + x].drawRect(x*gridPx + 1, y*gridPx, gridPx, gridPx);
            board[y*gridSize + x].endFill();
        }
    });
    await channel.presence.subscribe('enter', (member) => {
        console.log(`User ${member.clientId} has entered the channel.`);
        getMembers(channel);
    });
    await channel.presence.enter();
    await channel.presence.subscribe('leave', (member) => {
        console.log(`User ${member.clientId} has left the channel.`);
        getMembers(channel);
    });
    
    

    PIXI.utils.sayHello();
    
    const Sprite = PIXI.Sprite;
    const loader = PIXI.Loader.shared;
    const TextureCache = PIXI.utils.TextureCache;
    const Graphics = PIXI.Graphics;

    const app = new PIXI.Application({width: 601, height: 601});

    
    document.body.appendChild(app.view);

    let currdate = new Date();
    let seed = currdate.getTime();
    function random(){
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

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
            board[i].beginFill(0x66CCFF);
            let tX = i%gridSize, tY = Math.floor(i/gridSize);
            board[i].drawRect(tX*gridPx + 1, tY*gridPx, gridPx, gridPx);
            board[i].endFill();
            board[i].interactive = true;
            board[i].on('mousedown', clickFunc);
            app.stage.addChild(board[i]);
        }
        
        app.ticker.add(gameLoop);
    }

    function clickFunc(e){
        console.log('Mouse clicked ');
        console.log('X', e.data.global.x, 'Y', e.data.global.y);
        let x = Math.floor(e.data.global.x/gridPx);
        let y = Math.floor(e.data.global.y/gridPx);
        console.log('X', x, 'Y', y);
        // console.log(board[x][y]);
        console.log(x*gridPx, y*gridPx);
        let randcolor = Math.floor(random() * 0xFFFFFF);
        channel.publish('click', {c: randcolor, x: x, y: y});
    }


    function gameLoop(){
        if(animate){
            let x = Math.floor(Math.random()*10), y = Math.floor(random()*10);
            board[y*gridSize + x].beginFill(Math.floor(Math.random() * 0xFFFFFF));
            board[y*gridSize + x].drawRect(x*gridPx + 1, y*gridPx, gridPx, gridPx);
            board[y*gridSize + x].endFill();
        }   
    }
    channel.subscribe('reset', (msg) =>{
        for(i=0; i<gridSize*gridSize; i++){
            app.stage.removeChild(board[i]);
        }
        app.ticker.remove(gameLoop);
        board = [];
        turnedOn = [];
        historySync = [[],[],[]]
        loader
            .load(setup);
    })
    document.getElementById("resetbutton").addEventListener("click", function(){
        channel.publish('reset', null);
    })
    
}

doPubSub();