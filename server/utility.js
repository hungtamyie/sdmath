class Utility {
    objLength(obj) {
        var count = 0;
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                ++count;
        }
        return count;
    }

    oppositeTeam(t){
        return t == "a" ? "b" : "a";
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    secondsPassedSince(timestamp){
        return Math.ceil((Date.now() - timestamp)/1000);
    }
    }
module.exports = Utility;