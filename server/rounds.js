class Rounds {
    constructor(){
        this.data = [
            [
                {   
                    delay: 0,
                    t0: 0.5,
                    t1: 0.5,
                    t2: 1,
                    t4: 1
                },
                {   
                    delay: 20,
                    t0: 1,
                    t2: 0,
                    t3: 0.00000001,
                    t4: 1,
                },
                {   
                    delay: 500,
                    t0: 1,
                },
            ],
            [
                {   
                    delay: 0,
                    t0: 1,
                    t1: 3,
                },
                {   
                    delay: 10000000000000000000,
                    t0: 5,
                },
            ],
        ]
        this.currentRound = 0;
        this.waveTimer = 0;
        this.currentWave = 0;
        this.waitingForNoEnemies = false;
    }

    updateWaveSpawn(delta, noEnemies){
        var stuffToReturn=false;
        this.waveTimer+=delta;
        var waveDelay = this.data[this.currentRound][this.currentWave].delay;
        var numberOfWaves = this.data[this.currentRound].length
        if(this.waveTimer > waveDelay && this.currentWave < numberOfWaves && !this.waitingForNoEnemies){
            this.waveTimer = 0;
            stuffToReturn = this.data[this.currentRound][this.currentWave]
            if(!this.waitingForNoEnemies && this.currentWave < numberOfWaves - 1){
                this.currentWave++;
                if(this.currentWave == numberOfWaves - 1){
                    this.waitingForNoEnemies = true;
                }
            }
        }
        if(this.waitingForNoEnemies && noEnemies){
            this.currentWave = 0;
            this.waveTimer = 0;
            this.currentRound++;
        }
        return stuffToReturn;
    }

    getCurrentRound(){
        return this.currentRound;
    }
}
module.exports = Rounds;