
var levelMapping = {
    level1: [
       [100, 5]
    ],
    level2: [
       [70, 7, 4],
       [30, 4]
    ],
    level3: [
       [70, 8, 5],
       [30, 5]
    ],
    level4: [
       [70, 10, 7],
       [30, 7]
    ],
    level5: [
       [60, 12, 9,true],
       [30, 9, 6,true],
       [10, 6, 5]
    ],
    level6: [
       [60, 15, 12,true],
       [30, 12, 9,true],
       [10, 9, 5]
    ],
    level7: [
       [60, 20, 15,true],
       [30, 15, 12,true],
       [10, 12, 9]
    ],
    level8: [
       [90, 20, 14,true],
       [10, 14, 5]
    ],
    level9: [
        [80, 30, 18,true],
        [15, 18, 5,true],
        [5, 5]
    ],
    level10: [
        [80, 50, 20,true],
        [15, 20, 5,true],
        [5, 5]
    ],
 }
 
 
function generateProblems(type, level, amount){
    if(type == "Multiplication" || type == "Division") return generateAdvancedProblems(type,Number(level.substr(5)),amount);
    var newProblems = [];
    var levelData = levelMapping[level]
    var problemSets = []
    var levelNumberReal = Number(level.substr(5))
    for(let i=0; i < levelData.length; i++){
        let possibleSums = generateAllSumsUnderMax(levelData[i][1],levelData[i][2],levelData[i][3])
        shuffle(possibleSums);
        problemSets.push({percentage: levelData[i][0],problems: possibleSums,nextProblem: 0})
    }
    while(newProblems.length < amount){
        var percentageIndex = (newProblems.length%15)*15;
        for(let i = problemSets.length-1; i >= 0; i--){
            if(problemSets[i].percentage > percentageIndex || i == 0){
                if(problemSets[i].nextProblem >= problemSets[i].problems.length){
                    problemSets[i].nextProblem = 0;
                    shuffle(problemSets[i]);
                }
                var newProblem = JSON.parse(JSON.stringify(problemSets[i].problems[problemSets[i].nextProblem]))
                if(Math.random()<0.5){
                    newProblem = [newProblem[1],newProblem[0]]
                }
                newProblems.push(newProblem);
                problemSets[i].nextProblem++;
                break;
            }
        }
    }
    shuffle(newProblems);
    var unsorted = []
    for(let i=0; i<newProblems.length-1; i++){
        if(newProblems[i][0] == newProblems[i+1][0] && newProblems[i][1] == newProblems[i+1][1]){
            if(newProblems[i+2]){
                newProblems[i][0]=newProblems[i+2][1]
                newProblems[i][1]=newProblems[i+2][0]
            }
            else{
                newProblems[i][0]=newProblems[i-2][1]
                newProblems[i][1]=newProblems[i-2][0]
            }
        }
    }
    while(isRepeating(newProblems)){
        newProblems[isRepeating(newProblems)] = [getRandomInt(0,Math.ceil(levelNumberReal/2)),getRandomInt(0,Math.ceil(levelNumberReal/2))]
    }
    if(type=="Subtraction"){
        for(let i=0; i<newProblems.length; i++){
            newProblems[i][0]+=newProblems[i][1];
        }
    }
    return newProblems;
}
function isRepeating(problems){
    for(let i = 0; i < problems.length-1; i++){
        if(problems[i][0] == problems[i+1][0] && problems[i][1] == problems[i+1][1]){
            return i+1
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAllSumsUnderMax(max, exclude, noIdentity){
    let zoutput = []
    if(!exclude) exclude=-1
    let iMin = 0;
    if(noIdentity==true) iMin=1;
    for(let zi=max; zi >= iMin; zi--){
        for(let zj=(max-zi); zj >=zi&&(zj+zi>exclude); zj--){
            zoutput.push([zi,zj])
        }
    }
    return zoutput;
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


function generateAdvancedProblems(type,level,amount){
    var output = [];
    var noshuffle = false;
    if(type == "Division") noshuffle = true; 
    var possibleProblems = generateProducts(level,noshuffle)
    var problemIndex = 0;
    var lastProblem = undefined;
    shuffle(possibleProblems)
    for(let i = 0; i < amount; i++){
        output.push(JSON.parse(JSON.stringify((possibleProblems[problemIndex]))))
        problemIndex++;
        if(problemIndex >= possibleProblems.length) {
            lastProblem = output[output.length - 1]
            problemIndex = 0;
            do{
                possibleProblems = generateProducts(level,noshuffle)
                shuffle(possibleProblems)
            }
            while(lastProblem[0] == possibleProblems[0][0] && lastProblem[1] == possibleProblems[0][1])
        }
    }
    if(type == "Division"){
        for(let i = 0; i < output.length; i++){
            output[i] = JSON.parse(JSON.stringify([output[i][0],output[i][1]]))
            output[i][0] *= output[i][1]
        }
    }
    return output;
}

function canGetSameProblemTwice(){
    var youareafailure = false;
    var failureCount = 0;
    for(let i = 0; i < 10000; i++){
        var problems = generateProblems("Addition", "level1", 100)
        for(let j = 0; j < problems.length-1; j++){
            if((problems[j][0] == problems[j+1][0] && problems[j][1] == problems[j+1][1]) || (problems[j][0] + problems[j][1] > 5)){
                failureCount++
                youareafailure = true;
            }
        }
    }
    console.log("failures:" + failureCount)
    return "You are a failure? " + youareafailure
}

function generateProducts(mult, noshuffle){
    let output = []
    for(let i = 1; i <= 12; i++){
        if(Math.random() < 0.5 && !noshuffle){
            output.push([mult,i])
        }
        else {
            output.push([i, mult])
        }
    }
    return output;
}

