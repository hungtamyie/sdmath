const Rounds = require('./rounds.js');
class Servergame {
    constructor(roomCode){
        this.roomCode = roomCode
        this.enemies = {};
        this.players = {};
        this.playerCount = 0;
        this.idCounter = 0;
        this.events = [];
        this.rounds = new Rounds();
    }

    addPlayer(id,socket){
        this.players[id]=new Player(id,socket)
        this.playerCount++;
    }

    removePlayer(id){
        if(!this.players[id]) return;
        this.playerCount--;
        delete this.players[id]
    }

    receiveGameInfo(infos){
        for(let i = 0; i < infos.length; i++){
            let info = infos[i]
            if(!this.players[info[1]]) continue;
            if(info[0] == "STATEUPDATE"){
                var pId = info[1]
                var pData = info[2]
                this.players[pId].x = pData.x
                this.players[pId].y = pData.y
                this.players[pId].health = pData.health
                this.players[pId].maxHealth = pData.maxHealth
                this.players[pId].energy = pData.energy
                this.players[pId].maxEnergy = pData.maxEnergy
                this.players[pId].shieldLevel = pData.shieldLevel
                this.players[pId].dead = pData.dead

            }
            if(info[0] == "NEWBULLET"){
                var bullet = JSON.parse(JSON.stringify(info[2]))
                this.events.push(["NEWBULLET", bullet.id, bullet])
            }
            if(info[0] == "BULLETDEATH"){
                this.events.push(["BULLETDEATH", info[1], info[2]])
            }
            if(info[0] == "ROCKETEXPLODE"){
                this.events.push(["ROCKETEXPLODE", info[1], info[2]])
            }
            if(info[0] == "PLAYERDAMAGE"){
                this.events.push(["PLAYERDAMAGE", info[1], info[2]])
            }
            if(info[0] == "ENEMYHIT"){
                if(this.enemies[info[2].id]){
                    let enemy = this.enemies[info[2].id]
                    enemy.health -= info[2].damage
                    if(enemy.aggroAfterShot && this.players[info[1]]){
                        enemy.target = this.players[info[1]]
                        enemy.aggroTimer = -1000
                    }
                    if(enemy.health <= 0){
                        if(enemy.type==3){
                            this.spawnEnemyGroup(enemy.x,enemy.y)
                        }
                        this.deleteEnemy(info[2].id)
                    }
                }
            }
        }
    }

    update(delta){
        let waveToSpawn = this.rounds.updateWaveSpawn(delta, false)
        if(waveToSpawn){
            if(waveToSpawn.t0){
                this.spawnEnemies(0,waveToSpawn.t0*this.playerCount)
            }
            if(waveToSpawn.t1){
                this.spawnEnemies(1,waveToSpawn.t1*this.playerCount)
            }
            if(waveToSpawn.t2){
                this.spawnEnemies(2,waveToSpawn.t2*this.playerCount)
            }
            if(waveToSpawn.t3){
                this.spawnEnemies(3,waveToSpawn.t3*this.playerCount)
            }
            if(waveToSpawn.t3){
                this.spawnEnemies(4,waveToSpawn.t4*this.playerCount)
            }
        }

        this.updateEnemies(delta)
    }

    spawnEnemyGroup(x,y){
        for(let i = 0; i < 4; i++){
            let id = this.newId()
            this.enemies[id] = new Enemy(id, 1, x, y)
            this.enemies[id].x += Math.random()*5
            this.enemies[id].y += Math.random()*5
        }
    }

    spawnEnemies(type,count){
        for(let i = -1; i < count; i++){
            let id = this.newId()
            this.enemies[id] = new Enemy(id, type)
            this.enemies[id].x += Math.random()*5
        }
    }

    deleteEnemy(id){
        if(this.enemies[id]){
            delete this.enemies[id]
        }
    }

    updateEnemies(delta){
        for (const key in this.enemies) {
            if (this.enemies.hasOwnProperty(key)) {
                let enemy = this.enemies[key]

                //Collide with walls
                if(enemy.x < 0 + enemy.size){enemy.x += 5}
                if(enemy.x > 2500 - enemy.size){enemy.x -= 5}
                if(enemy.y < 0 + enemy.size){enemy.y += 5}
                if(enemy.y > 2500 - enemy.size){enemy.y -= 5}
                
                //Collide with other enemies
                var closeCount = 0;
                for (const key2 in this.enemies) {
                    if (this.enemies.hasOwnProperty(key2)) {
                        let enemy2 = this.enemies[key2]
                        var enemyOffsetX = enemy2.x - enemy.x
                        var enemyOffsetY = enemy2.y - enemy.y
                        var enemyOffsetDist = Math.sqrt(enemyOffsetX**2+enemyOffsetY**2)||1;
                        if(enemyOffsetDist < enemy.size + enemy2.size){
                            if(enemyOffsetDist==0){enemy.x+=0.1}

                            var enemyPushRatio = 1
                            var oppositePushRatio = 1
                            
                            enemy.x -= (enemyOffsetX/enemyOffsetDist*delta/5)*enemyPushRatio
                            enemy.y -= (enemyOffsetY/enemyOffsetDist*delta/5)*enemyPushRatio
                            enemy2.x += (enemyOffsetX/enemyOffsetDist*delta/5)*oppositePushRatio
                            enemy2.y += (enemyOffsetY/enemyOffsetDist*delta/5)*oppositePushRatio
                        }
                        if(enemyOffsetDist < 30){
                            closeCount++;
                        }
                    }
                }
                if(closeCount > 3 && enemy.dislikesSwarming){
                    enemy.geographicalTarget = {x: Math.random()*2500, y: Math.random()*2500}
                    enemy.aggroTimer = -500
                }
                if(closeCount == 0 && enemy.dislikesSwarming){
                    enemy.aggroTimer = 10000
                    enemy.geographicalTarget = false;
                }

                //Chase players
                enemy.aggroTimer+=delta;
                if(enemy.aggroTimer > 100){
                    enemy.aggroTimer = 0;
                    let closestPlayer = undefined;
                    var playerCount = 0;
                    for (const pkey in this.players) {
                        if (this.players.hasOwnProperty(pkey)) {
                            let player = this.players[pkey]
                            if(player.dead) continue;
                            playerCount++;
                            if(!closestPlayer){closestPlayer = player}
                            else {
                                if(this.getDistance(player,enemy) < this.getDistance(enemy, closestPlayer)){
                                    closestPlayer = player;
                                }
                            }
                        }
                    }
                    enemy.target = closestPlayer;
                    if(playerCount == 0 && !enemy.geographicalTarget){
                        enemy.geographicalTarget = {x: Math.random()*2500, y: Math.random()*2500}
                    }
                }
                for (const pkey in this.players) {
                    if (this.players.hasOwnProperty(pkey)) {
                        let player = this.players[pkey]
                        if(player.shieldLevel != 0){
                            this.shieldRepel(enemy,player,delta)
                        }
                    }
                }
                let targetPos = {x: enemy.x, y: enemy.y}
                if(enemy.geographicalTarget){
                    targetPos=enemy.geographicalTarget;
                }
                else if(enemy.target){
                    targetPos={x: enemy.target.x, y: enemy.target.y}
                    if(enemy.target.dead){
                        enemy.target = false;
                    }
                }
                else {
                    enemy.aggroTimer = 100;
                }
                var targetOffsetX = targetPos.x - enemy.x
                var targetOffsetY = targetPos.y - enemy.y
                var targetOffsetDist = Math.sqrt(targetOffsetX**2+targetOffsetY**2)||1;
                enemy.x += (targetOffsetX/targetOffsetDist)*delta*enemy.speed/2
                enemy.y += (targetOffsetY/targetOffsetDist)*delta*enemy.speed/2
                if(targetOffsetDist < 10 && enemy.geographicalTarget){
                    enemy.geographicalTarget = false;
                    enemy.aggroTimer = 100;
                }
                if(enemy.target && enemy.shoots == true && enemy.attackTimer <= 0 && this.getDistance(enemy.target,enemy) < enemy.range){
                    targetOffsetX = enemy.target.x - enemy.x
                    targetOffsetY = enemy.target.y - enemy.y
                    targetOffsetDist = Math.sqrt(targetOffsetX**2+targetOffsetY**2)||1;

                    var enemyBullet
                    if(enemy.type==2) enemyBullet={id: this.newId(), x: enemy.x, y: enemy.y, launcherId: enemy.id, vX: targetOffsetX/targetOffsetDist, vY: targetOffsetY/targetOffsetDist, spawnTime: Date.now(), size: 2.5, speed: 1.8, damage: 4, shieldDamage: 0.1, team: "ENEMY", explosionClass: "enemybasic", launchEffect: "enemyshot"}
                    if(enemy.type==3) enemyBullet={id: this.newId(), x: enemy.x, y: enemy.y, launcherId: enemy.id, vX: targetOffsetX/targetOffsetDist, vY: targetOffsetY/targetOffsetDist, spawnTime: Date.now(), size: 15, speed: 1, damage: 10, shieldDamage: 7, flashes: true, team: "ENEMY", explosionClass: "enemyhuge", launchEffect: "hugeenemyshot"}
                    this.events.push(["NEWBULLET", enemyBullet.id, enemyBullet])
                    enemy.attackTimer = enemy.reloadTime/2 + (Math.random()*enemy.reloadTime/2);
                }
                
                if(enemy.target && enemy.lasers && enemy.attackTimer <= 0 && this.getDistance(enemy.target,enemy) < enemy.range){
                    var laserId = this.newId();
                    this.events.push(["LASERFIRED", laserId, {from: enemy.id, to: enemy.target.id}]);
                    enemy.attackTimer = enemy.reloadTime/2 + (Math.random()*enemy.reloadTime/2);
                }

                enemy.attackTimer -= delta
            }
        }   
    }

    shieldRepel(enemy,player,delta){
        console.log("repel")
        var offsetX = enemy.x - player.x
        var offsetY = enemy.y - player.y
        var offsetDist = Math.sqrt(offsetX**2+offsetY**2)||0;
        
        var shieldSize = 40;
        if(player.shieldLevel == 2){shieldSize = 70}
        if(offsetDist < shieldSize + enemy.size && enemy.size < 40){
            enemy.x += offsetX/offsetDist*3*delta
            enemy.y += offsetY/offsetDist*3*delta
        }
    }

    getDistance(a,b){
        var dX = a.x - b.x
        var dY = a.y - b.y
        return Math.sqrt(dX**2+dY**2)||0;
    }

    resetEvents(){
        this.events = [];
    }

    toJson(){
        var output = {}
        var playersJson = {};
        for (const key in this.players) {
            if (this.players.hasOwnProperty(key)) {
                let player = this.players[key]
                playersJson[player.id]=player.toJson();
            }
        }
        var enemiesJson = {}
        for (const key in this.enemies) {
            if (this.enemies.hasOwnProperty(key)) {
                let enemy = this.enemies[key]
                enemiesJson[enemy.id]=enemy.toJson();
            }
        }
        output.players = playersJson;
        output.enemies = enemiesJson;
        output.bullets = this.bullets;
        output.events = this.events;
        return JSON.stringify(output);
    }

    newId(){
        return "id"+this.idCounter++
    }
}

class Player {
    constructor(id,socket){
        this.id = id
        this.socket = socket
        this.x = 0
        this.y = 0
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 50;
        this.maxEnergy = 100;
        this.shieldLevel = 0;
    }

    toJson(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            health: this.health,
            maxHealth: this.maxHealth,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            shieldLevel: this.shieldLevel,
            dead: this.dead
        }
    }
}

class Enemy {
    constructor(id, type, x, y){
        this.id = id;
        if(typeof x != "undefined" && typeof y != "undefined"){
            this.x = x;
            this.y = y;
        }
        else {
            let randomBorder = Math.random()
            if(randomBorder < 0.25){
                this.x = -20;
                this.y = Math.random()*2500;
            }
            else if(randomBorder < 0.5){
                this.x = 2520;
                this.y = Math.random()*2500;
            }
            else if(randomBorder < 0.75){
                this.y = -20;
                this.x = Math.random()*2500;
            }
            else {
                this.y = 2520;
                this.x = Math.random()*2500;
            }
        }
        this.health = 30;
        this.maxHealth = 30;
        this.target = "";
        this.geographicalTarget = false;
        this.speed = 1;
        this.size = 10;
        this.currentCharge = 0;
        this.attackTimer = 0;
        this.aggroTimer = 0;
        this.reloadTime = 100;
        this.type=type;
        this.healthbarOffset=0;
        this.healthbarSize=1;
        this.touchDamage=2;
        this.range=500;
        this.dislikesSwarming=(Math.random()>0.5)
        if(this.type == 0){
            this.speed = 1         
            this.touchDamage = 2   
            this.aggroAfterShot=true
        }
        else if(this.type == 1){
            this.speed = 2.3
            this.touchDamage = 3
            this.health=20
            this.maxHealth=20
        }
        else if(this.type == 2){
            this.speed = 1
            this.touchDamage = 2
            this.health=30
            this.maxHealth=30
            this.aggroAfterShot=true;
            this.size=18;
            this.shoots=true;
            this.reloadTime=120;
            this.healthbarOffset=-10;
            this.healthbarSize=1.5
            this.range=500;
        }
        else if(this.type == 3){
            this.speed = 0.6
            this.touchDamage = 15   
            this.dislikesSwarming = false;
            this.size=60
            this.healthbarOffset=-50;
            this.shoots=true;
            this.healthbarSize=4;
            this.reloadTime=400;
            this.maxHealth=300;
            this.health=300;
            this.range=800;
        }
        else if(this.type == 4){
            this.speed = 0.2
            this.touchDamage = 10
            this.dislikesSwarming = false;
            this.lasers=true;
            this.laserTarget="random";
            this.reloadTime=300;
            this.health=60;
            this.maxHealth=60;
            this.range=10000000;
            this.healthbarSize=1.2;
            this.healthbarOffset=-10;
            this.size = 15;
        }
    }
    
    toJson(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            health: this.health,
            maxHealth: this.maxHealth,
            size: this.size,
            type: this.type,
            touchDamage: this.touchDamage,
            healthbarOffset: this.healthbarOffset,
            healthbarSize: this.healthbarSize,
        }
    }
}

module.exports = Servergame;