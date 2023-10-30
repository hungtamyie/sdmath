var canvas;
var ctx; 

function startGame(type){
    var level = 0;
    if(type == "Addition"){
        level = myMaxAdditionLevel
    }
    else {
        level = myMaxSubtractionLevel
    }
    changeScreen("gameScreen")
    $("#shotSelect0").css("background-position", ("-0em"))
    $("#shotSelect1").css("display", "none")
    $("#shotSelect2").css("display", "none")
    resetStats()

    myStats.maxEnergy += level*2;
    if(level == 8 || level == 9 || level == 7){
        myStats.maxEnergy += level*2
    }
    myStats.energy = myStats.maxEnergy/3;
    myStats.energyGain += level/2.5;
    if(level == 8 || level == 9 || level == 7){
        myStats.energyGain += level/5
    }
    myStats.mathLevel = level
    if(level == 0)myStats.mathLevel = 1
    myStats.mathType = type
    if(!amTeacher){
        setupShop(level)
    }else {
        myStats.amDead = true;
        $("#holdSpaceMessage").css("visibility", "hidden")
    }
    getMoreGameProblems()
    selectShot(0)
    shadowData={}
    gameRunning=true;
    myCurrentAnswer = "";
    hideStudentBanner();
}

function setupCanvas(){
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    canvas.onmousedown = function(e){
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        shoot(ictX(x),ictY(y))
    }
}

var S = 1
function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(window.innerHeight/9 * 16 > window.innerWidth){
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth/16*9;
    }
    else {
        canvas.width = window.innerHeight/9*16;
        canvas.height = window.innerHeight;
    }
    document.getElementById("canvasUI").style.width = canvas.width + "px";
    document.getElementById("canvasUI").style.height = canvas.height + "px";
    S = canvas.width/1600;
    document.getElementById("canvasUI").style.fontSize = S*2 +"px";
}

var myEntities = {}
var myPos = {
    x: 0,
    y: 0,
}
var myProblems = [];
var myCurrentAnswer = "";
var myStats = {
    speed: 0.8,
    health: 10,
    maxHealth: 10,
    energy: 10,
    maxEnergy: 10,
    amDead: false,
    touchHitCooldown: 0,
    damageModifier: 4,
    shieldLevel: 0,
    shieldDeploying: 0,
    mathLevel: 2,
    respawnCount: 0,
    respawnProblems: 0,
    mathType: "Subtraction",
    gunType: 1, 
    gunA: 0,
    gunB: false,
    gunC: false,
    energyGain: 1.5,
    invincibility: 300,
    gameEndingTimer: 1000,
}
var myUpgrades = {
    shield: 0,
}
var camera = {
    x: 0,
    y: 0,
    zoom: 3.5,
}
var timeSinceLastUpdate = 0;

function resetStats(){
    myPos = {
        x: Math.random()*2500,
        y: Math.random()*2500,
    }
    myStats = {
        speed: 0.8,
        health: 10,
        maxHealth: 10,
        energy: 10,
        maxEnergy: 10,
        amDead: false,
        touchHitCooldown: 0,
        damageModifier: 1,
        shieldLevel: 0,
        shieldDeploying: 0,
        mathLevel: 2,
        respawnCount: 0,
        respawnProblems: 0,
        mathType: "Subtraction",
        gunType: 1, 
        gunA: 0,
        gunB: false,
        gunC: false,
        energyGain: 1,
        invincibility: 300,
        gameEndingTimer: 1000,
    }
    myProblems = [];
    myUpgrades = {
        shield: 0,
    }
}

var keys = {

}
document.onkeydown = function(ev){
    let key = ev.key.toLowerCase()
    keys[ev.key.toLowerCase()]=true;
    var mathKeys = ["1","2","3","4","5","6","7","8","9","0","backspace","enter","delete"]
    if(mathKeys.includes(ev.key.toLowerCase())){
        doGameMath(ev.key.toLowerCase())
    }
    if(key=="z"){selectShot(0)}
    if(key=="x"){selectShot(1)}
    if(key=="c"){selectShot(2)}
}
document.onkeyup = function(ev){
    keys[ev.key.toLowerCase()]=false;
}
var respawnMapping = [1,5,10,30,60,100,300]

function getMoreGameProblems(){
    myProblems = myProblems.concat(generateProblems(myStats.mathType, "level"+(myStats.mathLevel), 50))
}
function respawn(){
    myStats.amDead = false;
    myStats.energy = myStats.maxEnergy/3;
    myStats.health = myStats.maxHealth;
    myStats.invincibility = 300;
    selectShot(0);
}

function doGameTick(delta){
    timeSinceLastUpdate+=delta;
    if(timeSinceLastUpdate > 10 && myRoom){
        timeSinceLastUpdate = 0;
        gameInformation.push(["STATEUPDATE",socket.id,{x: myPos.x, y: myPos.y, health: myStats.health, maxHealth: myStats.maxHealth, energy: myStats.energy, maxEnergy: myStats.maxEnergy, dead: myStats.amDead, shieldLevel: myStats.shieldLevel}])
        socket.emit("gameInfo",gameInformation)
        gameInformation=[];
    }
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawMap();
    updateMe(delta);
    trackCamera();
    drawOtherPlayers(delta);
    drawMe(delta);
    drawEnemies(delta);
    drawAndUpdateBullets(delta);
    drawParticles(delta)
    updateUI(delta)
    drawSheilds(delta)
    updateBulletQueue(delta)
    drawAndUpdateLasers(delta)
    drawHpBars()
    drawPlayerNames()
}

var gameInformation = [

]

function drawMe(){
    if(myStats.amDead) return;
    ctx.globalAlpha = 1;
    if(myStats.invincibility > 0) ctx.globalAlpha = 0.2;
    drawCircle(myPos.x,myPos.y,10,"aqua")
    ctx.globalAlpha = 1;
}

function updateMe(delta){
    var dirVector = [0,0]
    var speedMod = 1
    if(keys["shift"] && myStats.energy > 0 && myStats.shieldLevel == 0){speedMod=1.8}
    if(keys["a"]||keys["arrowleft"]){dirVector[0]+=-1}
    if(keys["d"]||keys["arrowright"]){dirVector[0]+=1}
    if(keys["w"]||keys["arrowup"]){dirVector[1]+=-1}
    if(keys["s"]||keys["arrowdown"]){dirVector[1]+=1}
    var dirVectorMag = Math.sqrt(dirVector[0]**2+dirVector[1]**2)
    dirVector[0] = dirVector[0]/dirVectorMag||0
    dirVector[1] = dirVector[1]/dirVectorMag||0
    if(myStats.shieldLevel != 0){ dirVector[0] *= 0.3; dirVector[1] *= 0.3;}
    if(!myStats.amDead){
        myPos.x += dirVector[0]*myStats.speed*delta*speedMod
        myPos.y += dirVector[1]*myStats.speed*delta*speedMod
    }
    else {
        myPos.x += dirVector[0]*7*delta*((6-camera.zoom)/3)
        myPos.y += dirVector[1]*7*delta*((6-camera.zoom)/3)
    }

    if(myStats.amDead){
        if(keys["q"]){camera.zoom-=0.1*camera.zoom*delta/3}
        if(keys["e"]){camera.zoom+=0.1*camera.zoom*delta/3}
        if(camera.zoom < 1){camera.zoom=1}
        if(camera.zoom > 5){camera.zoom=5}
    }
    else {
        camera.zoom = 3
    }

    if(myPos.x-10 < 0){
        myPos.x=10
    }
    if(myPos.y-10 < 0){
        myPos.y=10
    }
    if(myPos.x+10 > 2500){
        myPos.x=2500-10
    }
    if(myPos.y+10 > 2500){
        myPos.y=2500-10
    }

    if(keys[" "] && !myStats.amDead && myStats.energy > 0 && myUpgrades.shield != 0){
        myStats.shieldLevel = myUpgrades.shield;
        myStats.energy -= 0.004*delta
    }
    else {
        myStats.shieldLevel = 0
    }
    if(speedMod != 1 && (dirVector[0] != 0 || dirVector[1] != 0)){
        myStats.energy -= 0.007*delta
    }
    if(myStats.energy < 0){myStats.energy = 0}
    myStats.touchHitCooldown -= delta;
    if(myStats.touchHitCooldown < 0) myStats.touchHitCooldown = 0;
    myShotCooldown -= delta;
    if(myShotCooldown < 0){
        myShotCooldown = 0;
        if(nextShot){
            shoot(nextShot[0],nextShot[1])
            nextShot = false;
        }
    }
    myStats.invincibility -= delta;
    if(myStats.invincibility < 0) myStats.invincibility = 0
    myStats.submissionTimer -= delta;
    if(myStats.submissionTimer < 0) myStats.submissionTimer = 0
    if(myStats.gameOver){
        myStats.gameEndingTimer -= delta;
        if(myStats.gameEndingTimer <= 0){
            endGame()
        }
    }
}

function endGame(){
    if(amTeacher){
        changeScreen("teacherScreen")
    }
    else {
        changeScreen("levelSelectScreen");
    }
    gameRunning = false;
    reShowStudentBanner()
}

function trackCamera(){
    camera.x = myPos.x-800/camera.zoom
    camera.y = myPos.y-450/camera.zoom
}

var shadowData={
}
var currentGameData={
    players: {},
    bullets: {},
    enemies: {},
    myBullets: [],
    wave: 0,
}
var particles=[

]
function newParticle(type,x,y,vx,vy){
    if(type == "basic"){
        particles.push({x: x, y: y, startSize: 15, endSize: 0, time: 20, fade: true, curTime: 20, shape: "circle", color: "white", outerColor: "magenta"})
    }
    if(type == "enemybasic"){
        particles.push({x: x, y: y, startSize: 10, endSize: 0, time: 35, fade: true, curTime: 35, shape: "circle", color: "white", outerColor: "red"})
    }
    if(type == "playerdamage"){
        particles.push({x: x, y: y, vx: 1.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "yellow"})
        particles.push({x: x, y: y, vx: -1.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "yellow"})
        particles.push({x: x, y: y, vx: 0, vy: 1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "yellow"})
        particles.push({x: x, y: y, vx: 0, vy: -1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "yellow"})
        particles.push({x: x, y: y, vx: 0, vy: 0, startSize: 15, endSize: 1, time: 20, fade: true, curTime: 20, shape: "circle", color: "yellow", outerColor: "yellow"})
    }
    if(type == "enemyexplode"){
        particles.push({x: x, y: y, vx: 1.5, vy: 1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "red"})
        particles.push({x: x, y: y, vx: -1.5, vy: 1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "red"})
        particles.push({x: x, y: y, vx: -1.5, vy: -1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "red"})
        particles.push({x: x, y: y, vx: 1.5, vy: -1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "red"})
        particles.push({x: x, y: y, vx: 0, vy: 0, startSize: 25, endSize: 1, time: 20, fade: false, curTime: 20, shape: "circle", color: "white", outerColor: "red"})
    }
    if(type == "laserend"){
        particles.push({x: x, y: y, startSize: 5, endSize: 15, time: 15, fade: true, curTime: 15, shape: "circle", color: "red"})
    }
    if(type == "basicshot"){
        particles.push({x: x, y: y, vx: vx, vy: vy, startSize: 5, endSize: 15, time: 15, fade: false, curTime: 15, shape: "circle", color: "white", outerColor: "magenta"})
    }
    if(type == "playerenergy"){
        particles.push({x: x, y: y, startSize: 35, endSize: 5, time: 25, fade: true, curTime: 25, shape: "circle", color: "blue", outerColor: "rgba(0,0,255,0.5)"})
    }
    if(type == "healthshot"){
        particles.push({x: x, y: y, vx: vx, vy: vy, startSize: 5, endSize: 15, time: 15, fade: false, curTime: 15, shape: "circle", color: "white", outerColor: "#00ff4c"})
    }
    if(type == "healthexplosion"){
        particles.push({x: x, y: y, vx: 1.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "#00ff4c"})
        particles.push({x: x, y: y, vx: -1.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "#00ff4c"})
        particles.push({x: x, y: y, vx: 0, vy: 1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "#00ff4c"})
        particles.push({x: x, y: y, vx: 0, vy: -1.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "#00ff4c"})
    }
    if(type == "splashshot"){
        particles.push({x: x, y: y, vx: vx*2, vy: vy*2, startSize: 5, endSize: 45, time: 15, fade: false, curTime: 15, shape: "circle", color: "white", outerColor: "magenta"})
    }
    if(type == "hugeenemyshot"){
        particles.push({x: x, y: y, vx: vx, vy: vy, startSize: 15, endSize: 35, time: 25, fade: false, curTime: 25, shape: "circle", color: "white", outerColor: "red"})
    }
    if(type == "enemyshot"){
        particles.push({x: x, y: y, vx: vx*2, vy: vy*2, startSize: 5, endSize: 15, time: 15, fade: false, curTime: 15, shape: "circle", color: "white", outerColor: "red"})
    }
    if(type == "enemyhuge"){
        particles.push({x: x, y: y, startSize: 60, endSize: 0, time: 35, fade: true, curTime: 35, shape: "circle", color: "white", outerColor: "red"})
    }
    if(type == "hugeexplosion"){
        particles.push({x: x, y: y, startSize: 80, endSize: 80, time: 5, fade: true, curTime: 5, shape: "circle", color: "white", outerColor: "magenta"})
        particles.push({x: x, y: y, startSize: 0, endSize: 80, time: 25, fade: true, curTime: 25, shape: "circle", color: "white", outerColor: "magenta"})
    }
    if(type == "rocketexplode"){
        particles.push({x: x, y: y, startSize: 35, endSize: 2, time: 15, fade: true, curTime: 15, shape: "circle", color: "white", outerColor: "white"})
        particles.push({x: x, y: y, vx: 3.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "white"})
        particles.push({x: x, y: y, vx: -3.5, vy: 0, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "white"})
        particles.push({x: x, y: y, vx: 0, vy: 3.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "white"})
        particles.push({x: x, y: y, vx: 0, vy: -3.5, startSize: 7, endSize: 1, time: 30, fade: true, curTime: 30, shape: "circle", color: "white"})
    }
    if(type == "smoke"){
        particles.push({x: x, y: y, startSize: 10, endSize: 0, time: 30, fade: true, curTime: 30, shape: "circle", color: "rgba(255,255,255,0.3)"})
    }
    if(type == "rocketshot"){
        particles.push({x: x, y: y, startSize: 5, endSize: 5, time: 5, fade: false, curTime: 5, shape: "circle", color: "yellow"})
        particles.push({x: x, y: y, vx: vx*0.5, vy: vy*0.5, startSize: 10, endSize: 40, time: 15, fade: true, curTime: 15, shape: "circle", color: "rgba(255,255,255,0.5)"})
    }
}
function drawParticles(delta){
    for(let i = particles.length-1; i >= 0; i--){
        particle = particles[i]
        var size = particle.endSize+((particle.startSize-particle.endSize) * (particle.curTime/particle.time))
        if(size < 0) size =0 
        var fade = particle.curTime/particle.time;
        if(fade > 1){fade = 1}
        if(fade < 0){fade = 0}
        if(particle.vx){particle.x += particle.vx * delta}
        if(particle.vy){particle.y += particle.vy * delta}
        ctx.globalAlpha = fade;
        if(particle.shape == "circle"){
            if(particle.outerColor){
                ctx.globalAlpha = fade*0.5;
                drawCircle(particle.x,particle.y,size*1.3,particle.outerColor)
            }
            ctx.globalAlpha = fade;
            drawCircle(particle.x,particle.y,size,particle.color)
        }
        ctx.globalAlpha = 1;
        particle.curTime-=delta;
        if(particle.curTime < 0){
            particles.splice(i,1)
        }
    }
}
function takeGameUpdate(data){
    currentGameData.players = {}
    for (const key in data.players) {
        if (data.players.hasOwnProperty(key)) {
            let player = data.players[key]
            if(player.id != socket.id){
                currentGameData.players[player.id] = player
                if(!shadowData[player.id]){
                    shadowData[player.id] = {x: player.x, y: player.y}
                }
            }
        }
    }
    if(data.gameOver){
        myStats.amDead = true;
        myStats.gameOver = true;
        myCurrentAnswer = "";
    }
    currentGameData.enemies = {}
    lob (data.enemies, (enemy)=>{
        currentGameData.enemies[enemy.id] = enemy
        if(!shadowData[enemy.id]){
            shadowData[enemy.id] = {x: enemy.x, y: enemy.y}
        }
    })
    for(let i = 0; i < data.events.length; i++){
        let event = data.events[i]
        if(event[0] == "BULLETDEATH"){
            var bulletId = event[2].id
            newParticle(event[2].type, event[2].x, event[2].y)
            deleteBullet(bulletId)
        }
        if(event[0] == "NEWBULLET"){
            if(!currentGameData.bullets[event[1]] && event[2].launcherId != socket.id){
                currentGameData.bullets[event[1]] = event[2];
                currentGameData.bullets[event[1]].spawnTime = Date.now();
                newParticle(event[2].launchEffect, event[2].x, event[2].y)
            }
        }
        if(event[0] == "PLAYERDAMAGE"){
            newParticle(event[2].type, event[2].x, event[2].y)
        }
        if(event[0] == "PLAYERENERGY"){
            newParticle(event[2].type, event[2].x, event[2].y)
        }
        if(event[0] == "ROCKETEXPLODE"){
            newParticle("rocketexplode", event[2].x, event[2].y)
        }
        if(event[0] == "ENEMYEXPLODE"){
            newParticle("enemyexplode", event[2].x, event[2].y)
        }
        if(event[0] == "LASERFIRED"){
            //newLaser(event[2])
            event[2].duration = 10;
            lasers.push(event[2])
        }
    }
    currentGameData.wave = data.wave;
    currentGameData.alivePlayerCount = data.alivePlayerCount;
}

var lasers = []
function drawAndUpdateLasers(delta){
    for(let i = lasers.length - 1; i >= 0; i--){
        let laser = lasers[i]
        let player = currentGameData.players[laser.to];
        if(laser.to == socket.id) player = myPos 
        if(currentGameData.enemies[laser.from] && player){
            let enemy = currentGameData.enemies[laser.from];
            console.log(enemy.x + " " + enemy.y + " " + player.x + " " + player.y)
            drawLine(enemy.x,enemy.y,player.x,player.y,3,"red")
            laser.duration -= delta;
            if(laser.duration < 0){
                newParticle("laserend", player.x, player.y)
                if(laser.to == socket.id){
                    gameInformation.push(["PLAYERDAMAGE",socket.id,{x: myPos.x, y: myPos.y, type: "playerdamage"}])
                    takeDamage(0.5)
                }
                lasers.splice(i,1)
            }
        }
    }
}


function updateUI(){
    var energyBarWidth = (80 + myStats.maxEnergy*7)
    $("#energyBarOuter").css("width", energyBarWidth+"em");
    var healthBarWidth = (80 + myStats.maxHealth*7)
    $("#hpBarOuter").css("width", healthBarWidth+"em");

    $("#energyBarInner").css("width", energyBarWidth*(myStats.energy/myStats.maxEnergy)+"em");
    $("#hpBarInner").css("width", healthBarWidth*(myStats.health/myStats.maxHealth)+"em");
    $("#hpBarInner").css("background",  getColor(myStats.health/myStats.maxHealth))
    
    $("#waveNumber").html("Wave " + currentGameData.wave)
    if(myStats.amDead){
        $("#energyBarInner").css("width", "0em");
        var ressurectionPercent = 1 - (myStats.respawnProblems/respawnMapping[myStats.respawnCount]);
        if(ressurectionPercent < 0) ressurectionPercent = 0
        if(ressurectionPercent > 1) ressurectionPercent = 1
        ressurectionPercent = (healthBarWidth*ressurectionPercent)+"em"
        $("#hpBarInner").css("width", ressurectionPercent);
        if(!amTeacher){
            ctx.fillStyle = "white"
            ctx.beginPath();
            ctx.arc(canvas.width/2,canvas.height/2,3*S,0,Math.PI*2,false);
            ctx.fill()
        }
    }
    $("#mathBoxAnswer").css("opacity", myStats.submissionTimer/100)
    $("#playerCount").html("Players alive: " + (currentGameData.alivePlayerCount||"0"))
    if(myStats.gameOver){
        $("#gameOverMessage").css("visibility","visible")
    }
    else {
        $("#gameOverMessage").css("visibility","hidden")
    }
    updateMathBox()
    updateShopText()

    if(amTeacher){
        $("#energyBarOuter").css("visibility", "hidden");
        $("#hpBarOuter").css("visibility", "hidden");
        $("#mathBox").css("visibility","hidden");
        $("#mathBoxAnswer").css("visibility","hidden");
        $("#shotSelect0").css("display", "none")
        $("#shotSelect1").css("display", "none")
        $("#shotSelect2").css("display", "none")
    }
}

function updateMathBox(){
    if(myStats.mathType == "Addition"){
        $("#mathBox").html(myProblems[0][0] + " + " + myProblems[0][1] + " = " + myCurrentAnswer)
    }
    else {
        $("#mathBox").html( myProblems[0][0] + " - " + myProblems[0][1] + " = " + myCurrentAnswer)
    }
    if((!myStats.amDead && (myStats.energy == myStats.maxEnergy || myStats.shieldLevel != 0)) || myStats.gameOver){
        $("#mathBox").html("")
        myCurrentAnswer = "";
    }
}

function doGameMath(symbol){
    if(symbol != "enter" && symbol != "delete" && symbol != "backspace" && myCurrentAnswer.length < 3){
        myCurrentAnswer += symbol
    }
    if(symbol == "backspace"){
        myCurrentAnswer=myCurrentAnswer.slice(0,-1)
    }
    if(symbol == "delete"){
        myCurrentAnswer=""
    }
    if(symbol == "enter" && myCurrentAnswer != ""){
        if(!myStats.amDead){
            if(myStats.energy < myStats.maxEnergy){
                if(myStats.mathType == "Addition"){
                    if(myProblems[0][0] + myProblems[0][1] == Number(myCurrentAnswer)){
                        gainEnergy()
                        gameInformation.push(["PLAYERENERGY",socket.id,{x: myPos.x, y: myPos.y, type: "playerenergy"}])
                        $("#mathBoxAnswer").html("Correct!")
                        $("#mathBoxAnswer").css("color", "#1CA805")
                    }
                    else {
                        loseEnergy()
                        //takeDamage(0.5)
                        gameInformation.push(["PLAYERDAMAGE",socket.id,{x: myPos.x, y: myPos.y, type: "playerdamage"}])
                        $("#mathBoxAnswer").html("Oops!")
                        $("#mathBoxAnswer").css("color", "#D20000")
                    }
                }
                if(myStats.mathType == "Subtraction"){
                    if(myProblems[0][0] - myProblems[0][1] == Number(myCurrentAnswer)){
                        gainEnergy()
                        gameInformation.push(["PLAYERENERGY",socket.id,{x: myPos.x, y: myPos.y, type: "playerenergy"}])
                        $("#mathBoxAnswer").html("Correct!")
                        $("#mathBoxAnswer").css("color", "#1CA805")
                    }
                    else {
                        loseEnergy()
                        //takeDamage(0.5)
                        gameInformation.push(["PLAYERDAMAGE",socket.id,{x: myPos.x, y: myPos.y, type: "playerdamage"}])
                        $("#mathBoxAnswer").html("Oops!")
                        $("#mathBoxAnswer").css("color", "#D20000")
                    }
                }
            }
        }
        else {
            if(myStats.mathType == "Addition"){
                if(myProblems[0][0] + myProblems[0][1] == Number(myCurrentAnswer)){
                    myStats.respawnProblems -= 1;
                    $("#mathBoxAnswer").html("Correct!")
                    $("#mathBoxAnswer").css("color", "#1CA805")
                }
                else {
                    myStats.respawnProblems += 3;
                    if(myStats.respawnProblems > respawnMapping[myStats.respawnCount]){myStats.respawnProblems = respawnMapping[myStats.respawnCount]}
                    $("#mathBoxAnswer").html("Oops!")
                    $("#mathBoxAnswer").css("color", "#D20000")
                }
            }
            if(myStats.mathType == "Subtraction"){
                if(myProblems[0][0] - myProblems[0][1] == Number(myCurrentAnswer)){
                    myStats.respawnProblems -= 1;
                    $("#mathBoxAnswer").html("Correct!")
                    $("#mathBoxAnswer").css("color", "#1CA805")
                }
                else {
                    myStats.respawnProblems += 3;
                    if(myStats.respawnProblems > respawnMapping[myStats.respawnCount]){myStats.respawnProblems = respawnMapping[myStats.respawnCount]}
                    $("#mathBoxAnswer").html("Oops!")
                    $("#mathBoxAnswer").css("color", "#D20000")
                }
            }
            if(myStats.respawnProblems == 0){
                respawn();
            }
        }
        myStats.submissionTimer = 100;
        myProblems.splice(0,1)
        if(myProblems.length < 5){getMoreGameProblems()}
        myCurrentAnswer=""
    }
}

function gainEnergy(){
    myStats.energy += myStats.energyGain;
    if(myStats.energy > myStats.maxEnergy){
        myStats.energy = myStats.maxEnergy;
    }
}

function loseEnergy(){
    myStats.energy -= myStats.energyGain*2;
    if(myStats.energy < 0){
        myStats.energy = 0;
    }
}

function getColor(value){
    //value from 0 to 1
    if(value < 0) value = 0
    if(value > 1) value = 1
    var hue=((value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

function drawBars(x, y, hpPercentage, energyPercentage, offset, size){
    var hpColor = getColor(hpPercentage)
    if(!offset) offset = 0 
    if(!size) size = 1
    
    drawRectangle(x-15*size, y-20+offset, 30*hpPercentage*size, 5, hpColor)
    drawRectangle(x-15*size, y-23+offset, 30*energyPercentage*size, 2, "blue")
}

function drawOtherPlayers(delta){
    lob(currentGameData.players, function(player){
        if(!player.dead){
            if(shadowData[player.id]){
                var pastPlayer = shadowData[player.id];
                var posXChange = player.x - pastPlayer.x;
                var posYChange = player.y - pastPlayer.y;
                var distance = Math.sqrt(posXChange**2+posYChange**2)||1;
                pastPlayer.x += (posXChange/Math.sqrt(distance))/4*delta;
                pastPlayer.y += (posYChange/Math.sqrt(distance))/4*delta;
                drawCircle(pastPlayer.x,pastPlayer.y,10,"blue")
                drawText(pastPlayer.x,pastPlayer.y-27,player.name)
            }
            else {
                drawCircle(player.x,player.y,10,"blue")
                drawText(player.x,player.y-27,player.name)
            }
    
            //Collide with player
            var playerOffsetX = player.x - myPos.x
            var playerOffsetY = player.y - myPos.y
            var playerOffsetDist = Math.sqrt(playerOffsetX**2+playerOffsetY**2)||1;
            if(playerOffsetDist < 20){
                myPos.x -= playerOffsetX/playerOffsetDist/1.5*delta
                myPos.y -= playerOffsetY/playerOffsetDist/1.5*delta
            }
        }
    })
}
function drawPlayerNames(){
    lob(currentGameData.players, function(player){
        if(!player.dead){
            if(shadowData[player.id]){
                var pastPlayer = shadowData[player.id];
                drawText(pastPlayer.x,pastPlayer.y-27,player.name)
            }
            else {
                drawText(player.x,player.y-27,player.name)
            }
        }
    })
    if(!myStats.amDead) drawText(myPos.x,myPos.y-27,myName)
}
function drawEnemies(delta){
    lob(currentGameData.enemies, function(enemy){
        if(shadowData[enemy.id]){
            var pastEnemy = shadowData[enemy.id];
            var posXChange = enemy.x - pastEnemy.x;
            var posYChange = enemy.y - pastEnemy.y;
            var distance = Math.sqrt(posXChange**2+posYChange**2)||1;
            pastEnemy.x += (posXChange/Math.sqrt(distance))/4*delta;
            pastEnemy.y += (posYChange/Math.sqrt(distance))/4*delta;
            drawEnemy(pastEnemy.x,pastEnemy.y,enemy)
        }
        else {
            drawEnemy(enemy.x,enemy.y,enemy)
        }

        //Collide with player
        if(!myStats.amDead){
            var playerOffsetX = enemy.x - myPos.x
            var playerOffsetY = enemy.y - myPos.y
            var playerOffsetDist = Math.sqrt(playerOffsetX**2+playerOffsetY**2)||1;
            if(playerOffsetDist < 10 + enemy.size){
                myPos.x -= playerOffsetX/playerOffsetDist/1.5*delta
                myPos.y -= playerOffsetY/playerOffsetDist/1.5*delta
                if(myStats.touchHitCooldown <= 0){
                    takeDamage(enemy.touchDamage);
                    myStats.touchHitCooldown = 70;
                    gameInformation.push(["PLAYERDAMAGE",socket.id,{x: myPos.x, y: myPos.y, type: "playerdamage"}])
                }
            }
        }
    })
}

function takeDamage(dmg){
    if(myStats.invincibility > 0) dmg = 0.5;
    myStats.health -= dmg;
    if(myStats.health <= 0){
        myStats.amDead = true;
        myStats.health = 0;
        gameInformation.push(["DIED",socket.id,])
        keys["w"]=false;
        keys["a"]=false;
        keys["s"]=false;
        keys["d"]=false;
        myStats.respawnCount++;
        myStats.respawnProblems = respawnMapping[myStats.respawnCount];
    }
    if(myStats.health > myStats.maxHealth){
        myStats.health = myStats.maxHealth
    }
}

function drawEnemy(x,y,enemy){
    if(enemy.type==0){
        let scale = 1.1
        drawRectangle(x-enemy.size*scale,y-enemy.size*scale,enemy.size*2*scale,enemy.size*2*scale,"red")
    }
    if(enemy.type==1){
        let scale = 1.1
        drawHollowRectangle(x-enemy.size*scale,y-enemy.size*scale,enemy.size*2*scale,enemy.size*2*scale,4,"red")
    }
    if(enemy.type==2){
        let scale = 1.1
        drawRectangle(x-enemy.size*scale/2,y-enemy.size*scale,enemy.size*scale,enemy.size*scale*2,"red")
        drawRectangle(x-enemy.size*scale,y-enemy.size*scale/2,enemy.size*scale*2,enemy.size*scale,"red")
        drawCircle(x,y,enemy.size*0.6*scale,"black")
    }
    if(enemy.type==3){
        drawCircle(x,y,enemy.size,"red")
        let scale = 0.6
        drawHollowRectangle(x-enemy.size*scale,y-enemy.size*scale,enemy.size*2*scale,enemy.size*2*scale,6,"black")
    }
    if(enemy.type==4){
        let scale = 1.1
        drawHollowRectangle(x-enemy.size*scale,y-enemy.size*scale,enemy.size*2*scale,enemy.size*2*scale,4,"red")
        scale = 0.2
        drawRectangle(x-enemy.size*scale,y-enemy.size*scale,enemy.size*2*scale,enemy.size*2*scale,"red")
    }
}


function drawSheilds(){
    if(myStats.shieldLevel == 1){
        drawCircle(myPos.x, myPos.y, 40, "rgba(0,200,255,0.2)")
    }
    if(myStats.shieldLevel == 2){
        drawCircle(myPos.x, myPos.y, 70, "rgba(0,200,255,0.2)")
    }
    lob(currentGameData.players, function(player){
        if(!player.dead){
            if(player.shieldLevel == 1){
                drawCircle(getShadowX(player), getShadowY(player), 40, "rgba(0,200,255,0.2)")
            }
            if(player.shieldLevel == 2){
                drawCircle(getShadowX(player), getShadowY(player), 70, "rgba(0,200,255,0.2)")
            }
        }
    })
}

function drawHpBars(){
    if(!myStats.amDead){
        let hpPercentage = myStats.health/myStats.maxHealth||0
        let energyPercentage = myStats.energy/myStats.maxEnergy||0
        drawBars(myPos.x, myPos.y, hpPercentage, energyPercentage)
    }

    lob(currentGameData.players, function(player){
        if(!player.dead){
            hpPercentage = player.health/player.maxHealth||0
            if(hpPercentage < 0) hpPercentage = 0
            energyPercentage = player.energy/player.maxEnergy||0
            if(energyPercentage < 0) energyPercentage = 0
            drawBars(getShadowX(player), getShadowY(player), hpPercentage, energyPercentage)
        }
    })
    lob(currentGameData.enemies, function(enemy){
        hpPercentage = enemy.health/enemy.maxHealth||0
        if(hpPercentage < 0) hpPercentage = 0
        drawBars(getShadowX(enemy), getShadowY(enemy), hpPercentage, false, enemy.healthbarOffset, enemy.healthbarSize)
    })
}
function getShadowX(player){
    if(shadowData[player.id]){
        return shadowData[player.id].x
    }
    else {
        return player.x
    }
}
function getShadowY(player){
    if(shadowData[player.id]){
        return shadowData[player.id].y
    }
    else {
        return player.y
    }
}

function drawAndUpdateBullets(realdelta){
    var curTime = Date.now()
    lob(currentGameData.bullets, function(bullet){
        var delta = (curTime-bullet.spawnTime)/10
        var bulletX= bullet.x + bullet.vX*delta*bullet.speed
        var bulletY = bullet.y + bullet.vY*delta*bullet.speed
        bullet.dX = bulletX
        bullet.dY = bulletY
        var bulletColor = "magenta"
        if(bullet.team == "ENEMY"){
            bulletColor = "red"
        }
        if(bullet.flashes) {
            if(curTime % 200 < 100){
                drawCircle(bulletX,bulletY,bullet.size,bulletColor)
            }
            else {
                drawCircle(bulletX,bulletY,bullet.size,bulletColor)
                drawCircle(bulletX,bulletY,bullet.size*0.8,"white")
            }
        }
        else if(bullet.health){
            drawRectangle(bulletX-bullet.size/2, bulletY-bullet.size, bullet.size, bullet.size * 2, "#00ff4c");
            drawRectangle(bulletX-bullet.size, bulletY-bullet.size/2, bullet.size * 2, bullet.size, "#00ff4c");
        }
        else if(bullet.isRocket){
            drawCircle(bulletX - bullet.vX*1.5*bullet.size,bulletY - bullet.vY*1.5*bullet.size,1.5*"yellow")
            drawCircle(bulletX,bulletY,2*bullet.size,"yellow")
            drawCircle(bulletX,bulletY,1.2*bullet.size,"white")
        }
        else {
            drawCircle(bulletX - bullet.vX*1.5*bullet.size,bulletY - bullet.vY*1.5*bullet.size,1.5*bullet.size,bulletColor)
            drawCircle(bulletX,bulletY,2*bullet.size,bulletColor)
            drawCircle(bulletX,bulletY,1.2*bullet.size,"white")
        }

        if(bulletX < 0 || bulletX > 2500 || bulletY < 0 || bulletY > 2500){
            deleteBullet(bullet.id)
        }

        if(bullet.team == "ENEMY" && !myStats.amDead){
            var dX = myPos.x - bullet.dX
            var dY = myPos.y - bullet.dY
            var dist = Math.sqrt(dX**2+dY**2)||0;
            if(myStats.shieldLevel > 0){
                var shieldSize = 40;
                if(myStats.shieldLevel == 2){shieldSize = 70}
                if(dist < shieldSize + 1){
                    gameInformation.push(["BULLETDEATH",socket.id,{id: bullet.id, x: bullet.dX, y: bullet.dY, type: bullet.explosionClass}])
                    if(bullet.shieldDamage){
                        myStats.energy -= bullet.shieldDamage/myStats.shieldLevel
                        if(myStats.energy < 0){myStats.energy = 0}
                    }
                    deleteBullet(bullet.id)
                }
            }
            if(dist < 9 + bullet.size){
                gameInformation.push(["BULLETDEATH",socket.id,{id: bullet.id, x: bullet.dX, y: bullet.dY, type: bullet.explosionClass}])
                takeDamage(bullet.damage);
                gameInformation.push(["PLAYERDAMAGE",socket.id,{x: myPos.x, y: myPos.y, type: "playerdamage"}])
                deleteBullet(bullet.id)
            }
        }
        if(bullet.team == "CLASS" && bullet.health == true && bullet.launcherId != socket.id){
            var dX = myPos.x - bullet.dX
            var dY = myPos.y - bullet.dY
            var dist = Math.sqrt(dX**2+dY**2)||0;
            if(dist < 11 + bullet.size){
                gameInformation.push(["BULLETDEATH",socket.id,{id: bullet.id, x: bullet.dX, y: bullet.dY, type: bullet.explosionClass}])
                takeDamage(bullet.damage);
            }
        }

    })

    //Update bullets i'm responsible for. 
    for(let i = 0; i < currentGameData.myBullets.length; i++){
        let bullet = currentGameData.bullets[currentGameData.myBullets[i]]
        if(bullet.isRocket){
            bullet.rocketCooldown -= realdelta;
        }
        lob(currentGameData.enemies, function(enemy){
            var dX = enemy.x - bullet.dX
            var dY = enemy.y - bullet.dY
            var dist = Math.sqrt(dX**2+dY**2)||0;
            if(dist < enemy.size + bullet.size + 1 && !bullet.health){
                if(bullet.isRocket){
                    if(bullet.rocketCooldown <= 0){
                        gameInformation.push(["ENEMYHIT",socket.id,{id: enemy.id, damage: bullet.damage}])
                        gameInformation.push(["ROCKETEXPLODE",socket.id,{x: bullet.dX, y: bullet.dY}])
                        bullet.rocketCooldown = 5;
                    }
                }
                else if(bullet.splash){
                    gameInformation.push(["ENEMYHIT",socket.id,{id: enemy.id, damage: bullet.damage}])
                    gameInformation.push(["BULLETDEATH",socket.id,{id: bullet.id, x: bullet.dX, y: bullet.dY, type: bullet.explosionClass}])
                    lob(currentGameData.enemies, function(splashenemy){
                        if(getDistance(splashenemy, {x: bullet.dX, y: bullet.dY}) < 80){
                            gameInformation.push(["ENEMYHIT",socket.id,{id: splashenemy.id, damage: bullet.damage}])
                        }
                    })
                    deleteBullet(bullet.id)
                }
                else {
                    gameInformation.push(["ENEMYHIT",socket.id,{id: enemy.id, damage: bullet.damage}])
                    gameInformation.push(["BULLETDEATH",socket.id,{id: bullet.id, x: bullet.dX, y: bullet.dY, type: bullet.explosionClass}])
                    deleteBullet(bullet.id)
                }
            }
        })
        if(bullet.rocketCooldown < 0){
            newParticle("smoke",bullet.dX, bullet.dY)
            bullet.rocketCooldown = 5;
        }
    }
}

function getDistance(a,b){
    var dX = a.x - b.x
    var dY = a.y - b.y
    return Math.sqrt(dX**2+dY**2)||0;
}

var myShotCooldown = 0;
var nextShot = false;
function shoot(x,y){
    if(myStats.amDead) return;
    if(myShotCooldown > 0 && nextShot != false) return;
    if(myShotCooldown > 0 && myShotCooldown < 50){nextShot = [x,y]; return}
    if(myShotCooldown > 0) return;
    if(myStats.energy - shotCosts[myStats.gunType] <= 0) return;
    var vX = x - myPos.x
    var vY = y - myPos.y
    var distance = Math.sqrt(vX**2+vY**2)||1
    vX = vX/distance;
    vY = vY/distance;

    if(myStats.gunType == 0){
        createBullet(vX,vY)
        myShotCooldown = 25
    }
    if(myStats.gunType == 1){
        var shotVector = [vX, vY]
        createBullet(vX,vY)
        var rightVector = rotateVector(shotVector, 15)
        createBullet(rightVector[0],rightVector[1])
        var leftVector = rotateVector(shotVector, -15)
        createBullet(leftVector[0],leftVector[1])
        myShotCooldown = 35
    }
    if(myStats.gunType == 2){
        var shotVector = [vX, vY]
        createBullet(vX,vY)
        var rightVector = rotateVector(shotVector, 0.2+2*Math.random())
        bulletQueue.push([10, rightVector[0], rightVector[1]])
        var leftVector = rotateVector(shotVector, -0.2-2*Math.random())
        bulletQueue.push([20, leftVector[0], leftVector[1]])
        myShotCooldown = 35
    }
    if(myStats.gunType == 3){
        createBullet(vX, vY, "splash")
        myShotCooldown = 100
    }
    if(myStats.gunType == 4){
        createBullet(vX, vY, "health")
        myShotCooldown = 5
    }
    if(myStats.gunType == 5){
        createBullet(vX, vY, "rocket")
        myShotCooldown = 60
    }
    drainEnergy(shotCosts[myStats.gunType])
}
var shotCosts = [0.5, 1, 1, 2.5, 0.3, 4]

function drainEnergy(energy){
    myStats.energy -= energy
    if(myStats.energy < 0){myStats.energy = 0}
}
var bulletQueue = []
function updateBulletQueue(delta){
    for(let i = bulletQueue.length-1; i >= 0; i--){
        bulletQueue[i][0] -= delta
        if(bulletQueue[i][0] < 0){
            createBullet(bulletQueue[i][1],bulletQueue[i][2])
            bulletQueue.splice(i,1)
        }
    }
}

function getDistance(a,b){
    var dX = a.x - b.x
    var dY = a.y - b.y
    return Math.sqrt(dX**2+dY**2)||0;
}

//Creates a bullet! vX and vY represent a unit vector
function createBullet(vX, vY,type){
    if(myStats.amDead) return;
    var myBullet = {id: uniqueId(), x: myPos.x, y: myPos.y, launcherId: socket.id, vX: vX, vY: vY, spawnTime: Date.now(), size: 2, speed: 3, damage: 4 * myStats.damageModifier, team: "CLASS", explosionClass: "basic", launchEffect: "basicshot"}
    if(type == "splash"){
        myBullet = {id: uniqueId(), x: myPos.x, y: myPos.y, launcherId: socket.id, vX: vX, vY: vY, spawnTime: Date.now(), size: 20, speed: 2.6, damage: 8 * myStats.damageModifier, splash: true, flashes: true, team: "CLASS", explosionClass: "hugeexplosion", launchEffect: "splashshot"}
    }
    if(type == "health"){
        myBullet = {id: uniqueId(), x: myPos.x, y: myPos.y, launcherId: socket.id, vX: vX, vY: vY, spawnTime: Date.now(), size: 7, speed: 2.5, damage: -0.5 * myStats.damageModifier, health: true, team: "CLASS", explosionClass: "healthexplosion", launchEffect: "healthshot"}
    }
    if(type == "rocket"){
        myBullet.isRocket = true;
        myBullet.size = 4;
        myBullet.rocketCooldown = 0;
        myBullet.damage = 10 * myStats.damageModifier;
        myBullet.launchEffect = "rocketshot";
    }
    gameInformation.push(["NEWBULLET",socket.id,myBullet])
    newParticle(myBullet.launchEffect, myBullet.x, myBullet.y, myBullet.vX*1.5, myBullet.vY*1.5)
    currentGameData.bullets[myBullet.id] = myBullet
    currentGameData.myBullets.push(myBullet.id)
}

function deleteBullet(bulletId){
    if(currentGameData.bullets[bulletId]){
        delete currentGameData.bullets[bulletId];
        for(let j = 0; j < currentGameData.myBullets.length; j++){
            if(currentGameData.myBullets[j] == bulletId){
                currentGameData.myBullets.splice(j,1)
                break
            }   
        }
    }
}

function selectShot(shotNumber){
    if(shotNumber == 0){
        myStats.gunType = myStats.gunA
        $("#shotSelect2").addClass("unselectedShot")
        $("#shotSelect1").addClass("unselectedShot")
        $("#shotSelect0").removeClass("unselectedShot")
    }
    if(shotNumber == 1 && myStats.gunB){
        myStats.gunType = myStats.gunB
        $("#shotSelect2").addClass("unselectedShot")
        $("#shotSelect0").addClass("unselectedShot")
        $("#shotSelect1").removeClass("unselectedShot")
    }
    if(shotNumber == 2 && myStats.gunC){
        myStats.gunType = myStats.gunC
        $("#shotSelect0").addClass("unselectedShot")
        $("#shotSelect1").addClass("unselectedShot")
        $("#shotSelect2").removeClass("unselectedShot")
    }
}

function lob(obj,todo){
for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            todo(obj[key])
        }
    }
}

var clickX = 0;
var clickY = 0;
function drawMap(){
    var lineColor = "rgb(50,50,50)"
    for(let i = 0; i < 25; i++){
        drawLine(i*100,0,i*100,2500,0.5,lineColor)
    }
    for(let i = 0; i < 25; i++){
        drawLine(0,i*100,2500,i*100,0.5,lineColor)
    }
    lineColor = "cyan"
    drawLine(0,0,0,2500,1,lineColor)
    drawLine(0,0,2500,0,1,lineColor)
    drawLine(2500,2500,0,2500,1,lineColor)
    drawLine(2500,2500,2500,0,1,lineColor)
}

function drawCircle(x,y,radius,color){
    ctx.fillStyle=color;
    ctx.beginPath()
    ctx.arc(ctX(x),ctY(y),ctS(radius),0,Math.PI*2,false)
    ctx.fill()
}

function drawLine(sX, sY, eX, eY, thickness, color){
    ctx.lineWidth=ctS(thickness)
    ctx.strokeStyle=color;
    ctx.beginPath()
    ctx.moveTo(ctX(sX),ctY(sY))
    ctx.lineTo(ctX(eX),ctY(eY))
    ctx.stroke();
}

function drawRectangle(x,y,w,h,color){
    ctx.fillStyle=color;
    ctx.fillRect(ctX(x),ctY(y),ctS(w),ctS(h))
}

function drawText(x,y,text){
    ctx.font = S*1.6 + "em Lilita One";
    ctx.fillStyle="white";
    ctx.textAlign = "center";
    ctx.fillText(text, ctX(x),  ctY(y));
}

function drawHollowRectangle(x,y,w,h,thickness,color){
    ctx.strokeStyle=color;
    ctx.lineWidth=ctS(thickness);
    ctx.strokeRect(ctX(x),ctY(y),ctS(w),ctS(h))
}


function ctS(n){
    return n*camera.zoom*S
}
function ctX(x){
    return (x-camera.x)*camera.zoom*S
}
function ctY(y){
    return (y-camera.y)*camera.zoom*S
}
function ictX(x){
    return x/S/camera.zoom+camera.x
}
function ictY(y){
    return y/S/camera.zoom+camera.y
}
var rotateVector = function(vec, ang)
{
    ang = -ang * (Math.PI/180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
};