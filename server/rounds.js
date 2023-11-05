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
                delay: 500,
                hpMod: 1,
                t0: 0.3,
                t2: 0.1
            },
            {   
                delay: 600,
                hpMod: 1,
                t0: 0.5,
                t2: 0.1
            },
            {   
                incrementsLevel: true,
                delay: 500,
                hpMod: 1,
                t0: 0.3,
                t1: 0.1
            },
            {   
                delay: 600,
                hpMod: 1,
                t0: 0.7,
                t1: 0.1
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
                delay: 500,
                hpMod: 1,
                t0: 0.3,
                t2: 0.1,
                t3: 0.08,
            },
            {   
                delay: 600,
                hpMod: 1,
                t0: 0.5,
                t2: 0.1,
                t4: 0.1,
                hpMod: 1.2,
            },
            {   
                incrementsLevel: true,
                delay: 99999,
                t0: 0.2,
                t1: 0.2,
                t4: 0.3,
                hpMod: 1.2,
            },
            {   
                delay: 1000,
                t0: 0.5,
                t1: 0.5,
                t3: 0.1,
                t2: 0.2,
                hpMod: 1.2,
            },
            {   
                incrementsLevel: true,
                delay: 10000000,
                t0: 0.5,
                t1: 0.5,
                t2: 0.2,
                t3: 0.3,
                t4: 0.5,
                hpMod: 1.2,
            },
            {   
                delay: 3000,
                t1: 0.5,
                t3: 0.2,
                t4: 0.1,
                hpMod: 1.2,
            },
            {   
                incrementsLevel: true,
                delay: 10000000,
                t0: 0.1,
                t1: 0.4,
                t2: 0.2,
                hpMod: 1.5,
                t3: 0.2,
                t4: 0.1,
            },
            {   
                incrementsLevel: true,
                delay: 4000,
                t0: 0.5,
                t1: 1,
                hpMod: 2,
                t3: 0.6,
                t4: 0.3,
            },
            {   
                incrementsLevel: true,
                delay: 1000000000,
                hpMod: 3,
                t1: 1,
                t3: 1,
                t4: 0.5,
            },
            {   
                incrementsLevel: true,
                delay: 1000000000,
                hpMod: 4,
                t1: 1,
                t2: 0.7,
                t3: 1,
                t4: 1,
            },
            {   
                incrementsLevel: false,
                delay: 500,
                hpMod: 6,
                t1: 1.5,
                t2: 2,
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
            this.currentWave++;
        }
        return stuffToReturn;
    }
}
module.exports = Rounds;