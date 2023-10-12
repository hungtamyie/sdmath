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
        [80, 50, 30,true],
        [15, 30, 5,true],
        [5, 5]
    ],
 }
 
 
 
function generateProblems(type, level, amount){
    var newProblems = [];
    var levelData = levelMapping[level]
    var problemSets = []
    for(let i=0; i < levelData.length; i++){
        let possibleSums = generateAllSumsUnderMax(levelData[i][1],levelData[i][2],levelData[i][3])
        shuffle(possibleSums)
        problemSets.push({percentage: levelData[i][0],problems: possibleSums,nextProblem: 0})
    }
    while(newProblems.length < amount){
        var percentageIndex = (newProblems.length%10)*10;
        for(let i = problemSets.length-1; i >= 0; i--){
            if(problemSets[i].percentage > percentageIndex || i == 0){
                if(problemSets[i].nextProblem >= problemSets[i].problems.length){
                    problemSets[i].nextProblem = 0;
                    shuffle(problemSets[i]);
                }
                var newProblem = problemSets[i].problems[problemSets[i].nextProblem]
                if(Math.random()<0.5){
                    newProblem = [newProblem[1],newProblem[0]]
                }
                newProblems.push(newProblem);
                problemSets[i].nextProblem++;
                break;
            }
        }
    }
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
    if(type=="Subtraction"){
        for(let i=0; i<newProblems.length; i++){
            newProblems[i][0]+=newProblems[i][1];
        }
    }
    return newProblems;
}

function generateAllSumsUnderMax(max, exclude, noIdentity){
    var output = []
    if(!exclude) exclude=-1
    var iMin = 0;
    if(noIdentity==true) iMin=1;
    for(i=max; i >= iMin; i--){
        for(j=(max-i); (j >=i&&(j+i>exclude)); j--){
            output.push([i,j])
            //output.push([i+j,j])
        }
    }
    return output;
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