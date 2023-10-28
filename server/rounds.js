class Rounds {
    constructor(){
        this.data = [
            {   
                incrementsLevel: true,
                delay: 4000,
                hpMod: 0.5,
                t0: 0.5,
            },
            {   
                delay: 2000,
                hpMod: 0.5,
                t0: 1,
            },
            {   
                incrementsLevel: true,
                delay: 2000,
                hpMod: 0.6,
                t0: 0.5,
                t1: 0.25,
            },
            {   
                delay: 1000,
                hpMod: 0.7,
                t0: 1,
                t2: 0.3,
            },
            { 
                incrementsLevel: true,  
                delay: 99999,
                hpMod: 0.8,
                t1: 0.7,
            },
            {   
                delay: 1000,
                hpMod: 0.9,
                t0: 0.6,
                t1: 0.2,
                t2: 0.4
            },
            {   
                delay: 500,
                hpMod: 0.9,
                t0: 0.2,
                t1: 0.2,
                t2: 0.6
            },
            {   
                incrementsLevel: true,
                delay: 99999,
                hpMod: 1,
                t0: 0.3,
                t2: 0.5,
                t3: 0.00000001,
            },
            {   
                delay: 1000,
                t0: 0.5,
                t1: 0.5,
                t2: 0.2,
            },
            {   
                incrementsLevel: true,
                delay: 99999,
                t0: 0.2,
                t1: 0.2,
                t4: 0.3,
            },
            {   
                delay: 1000,
                t0: 0.5,
                t1: 0.5,
                t2: 0.2,
            },
            {   
                incrementsLevel: true,
                delay: 10000000,
                t0: 0.5,
                t1: 0.5,
                t2: 0.2,
                t3: 0.3,
                t4: 0.5,
            },
            {   
                delay: 3000,
                t1: 0.5,
                t3: 0.6,
                t4: 0.9,
            },
            {   
                delay: 4000,
                t0: 0.5,
                t1: 1,
                hpMod: 2,
                t3: 0.6,
                t4: 0.9,
            },
            {   
                delay: 1000000000,
                hpMod: 3,
                t1: 1,
                t3: 1,
                t4: 1,
            },
        ]
        this.waveTimer = 0;
        this.currentWave = 0;
        this.level;
    }

    updateWaveSpawn(delta, noEnemies, tooManyEnemies){
        var stuffToReturn=false;
        this.waveTimer+=delta;
        if(!this.data[this.currentWave]) return false;
        if(tooManyEnemies) return false;
        var waveDelay = this.data[this.currentWave].delay;
        if(this.waveTimer > waveDelay || noEnemies){
            this.waveTimer = 0;
            stuffToReturn = this.data[this.currentWave]
            console.log(stuffToReturn)
            this.currentWave++;
        }
        return stuffToReturn;
    }
}
module.exports = Rounds;