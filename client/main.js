function changeScreen(screen){
    $("#levelSelectScreen").css("display", "none");
    $("#loginScreen").css("display", "none");
    $("#quizScreen").css("display", "none");
    $("#quizFinishScreen").css("display", "none");
    $("#teacherScreen").css("display", "none");
    $("#teacherLoginScreen").css("display", "none");
    $("#gameScreen").css("display", "none");
    $("#gameCreationScreen").css("display", "none");
    $("#" + screen).css("display", "flex");
}

window.onload = function(){
    changeScreen("loginScreen");
    changeScale();
    activateEnterKey();
    tick();
    displayRecords();
    checkLocalStorage()
    activateTeacherButtons();
    window.setInterval(() => {
        uploadResults()
    }, 6000);
    setupCanvas();
    resizeCanvas();
    socket=io()
}

function activateEnterKey(){
    $("#answerInput").on('keypress',function(e) {
        if(e.which == 13) {
            enterPressed()
        }
    });
    $('#answerInput,.smallInputNumeric,#teacherCodeInput,#studentCodeInput').keyup(function () {
        if (this.value != this.value.replace(/[^0-9]/g, '')) {
           this.value = this.value.replace(/[^0-9]/g, '');
        }
    });
    $("#studentNameInput").on('keypress',function(e) {
        if(e.which == 13) {
            searchStudents()
        }
    });
    $("#teacherPassword").on('keypress',function(e) {
        if(e.which == 13) {
            tryTeacherPassword()
        }
    });
    $("#studentCodeInput").on('keypress',function(e) {
        if(e.which == 13) {
            $("#studentNameLoginInput").focus()
        }
    });
    $("#studentNameLoginInput").on('keypress',function(e) {
        if(e.which == 13) {
            tryStudentJoin();
        }
    });
}

window.onresize = changeScale;

function changeScale(){
    var size = (window.innerWidth/2 + window.innerHeight)/2000
    $("html").css("font-size", size + "px")
}

var myMaxAdditionLevel = 0;
var myMaxSubtractionLevel = 0;
var gameRunning = false;
var offlineMode = false;
var timeLimit = 45
var selectedQuizType = "Addition"
var selectedLevel = 1
var scoreTally = [0,0]

function changeQuizType(type){
    if(type != selectedQuizType){
        if(type == "Subtraction"){
            $("#additionButton").addClass("deselected");
            $("#subtractionButton").removeClass("deselected");
            selectedQuizType = "Subtraction";
        }
        if(type == "Addition"){
            $("#subtractionButton").addClass("deselected");
            $("#additionButton").removeClass("deselected");
            selectedQuizType = "Addition";
        }
        updateTopRight();
    }
}

function updateTopRight(){
    if(selectedQuizType == "Addition"){
        $("#yourLevelInfo").html("You have passed<br> Level " + myMaxAdditionLevel + " Addition");
    }
    else {
        $("#yourLevelInfo").html("You have passed<br> Level " + myMaxSubtractionLevel + " Subtraction");
    }
}

function showStudentBanner(){
    $("#studentBanner").css("visibility","visible")
    $("#connectionStatus").html("Connected to " + makePossesive(teacherSettings.teacherName) + " room")
    $("#connectionStatus").removeClass("disconnected")
    if(offlineMode){
        $("#connectionStatus").html("Offline mode")
        $("#connectionStatus").addClass("disconnected")
    }

}

function hideStudentBanner(){
    $("#studentBanner").css("visibility","hidden")
}

function reShowStudentBanner(){
    $("#studentBanner").css("visibility","visible")
}

function makePossesive(name){
    if(name[name.length-1].toLowerCase() == "s"){
        return name + "'"
    }
    else {
        return name + "'s"
    }
}

function changeLevel(amount){
    selectedLevel += amount;
    if(selectedLevel < 1){
        selectedLevel = 1;
    }
    if(selectedLevel > 10){
        selectedLevel = 10;
    }
    $("#levelDisplay").html("Level " + selectedLevel);
}

var isPractice = false;
var currentProblems = [];
var currentProblemIndex = 0;
var appRunning = false;
var startTime = 0;
var teacherSettings = {
    quizProblems: 30,
    timeLimit: 50,
    passingPercentage: 85,
    correctionsMidTest: false,
    teacherName: "noteachererror"
}
function start(isQuiz){
    isPractice = !isQuiz;
    changeScreen("quizScreen");
    var f = !isPractice?"Test":"Practice"
    $("#quizTitle").html(selectedQuizType + " " + f)
    $("#outputBox").html("Good luck!")
    $("#answerInput").focus()
    $("#answerInput").val("")
    $("#progressBarInner").css("width","0rem")
    if(isPractice){
        $("#timeBanner").css("visibility","hidden")
        $("#progressBarOuter").css("visibility","hidden")
        currentProblems=generateProblems(selectedQuizType, "level"+selectedLevel, 40)
        currentProblemIndex = 0;
        appRunning = true;
        scoreTally = [0,0]
        startTime = new Date().getTime();
        nextQuestion();
    }
    else {
        $("#timeBanner").css("visibility","visible")
        $("#progressBarOuter").css("visibility","visible")
        currentProblems=generateProblems(selectedQuizType, "level"+selectedLevel, teacherSettings.quizProblems)
        currentProblemIndex = 0;
        appRunning = true;
        scoreTally = [0,0]
        startTime = new Date().getTime();
        nextQuestion();
    }
}

function nextQuestion(){
    currentProblemIndex++;
    if(currentProblemIndex >= currentProblems.length){
        currentProblemIndex = 0;
        currentProblems=generateProblems(selectedQuizType, "level"+selectedLevel, 40)
    }
    if(selectedQuizType == "Addition"){
        $("#question").html(currentProblems[currentProblemIndex][0] + "+" + currentProblems[currentProblemIndex][1]+"=")
    }
    else {
        $("#question").html(currentProblems[currentProblemIndex][0] + "-" + currentProblems[currentProblemIndex][1]+"=")
    }
}

function enterPressed(){
    if(appRunning){
        var currentProblem = currentProblems[currentProblemIndex];
        var response = $("#answerInput").val();
        $("#answerInput").val("")
        if(response == ""){
            return;
        }
        var isCorrect = false;
        if(selectedQuizType == "Addition"){
            isCorrect = response == currentProblem[0]+currentProblem[1]
        }
        else {
            isCorrect = response == currentProblem[0]-currentProblem[1]
        }
        if(isPractice || teacherSettings.correctionsMidTest){
            if(selectedQuizType == "Addition"){
                if(isCorrect){
                    $("#outputBox").html("<div class='check'></div>"+currentProblem[0]+"+"+currentProblem[1]+"="+(currentProblem[0]+currentProblem[1]))
                }
                else {
                    //$("#outputBox").html("<div class='x'></div><span style='color:#D61313'><s>"+currentProblem[0]+"+"+currentProblem[1]+"="+response+"</span></s> "+currentProblem[0]+"+"+currentProblem[1]+"="+(currentProblem[0]+currentProblem[1]))
                    $("#outputBox").html("<span style='color:#D61313'>"+currentProblem[0]+"+"+currentProblem[1]+"="+response+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"+currentProblem[0]+"+"+currentProblem[1]+"="+(currentProblem[0]+currentProblem[1]))
                }
            }
            else {
                if(isCorrect){
                    $("#outputBox").html("<div class='check'></div>"+currentProblem[0]+"-"+currentProblem[1]+"="+(currentProblem[0]-currentProblem[1]))
                }
                else {
                    $("#outputBox").html("<span style='color:#D61313'>"+currentProblem[0]+"-"+currentProblem[1]+"="+response+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"+currentProblem[0]+"-"+currentProblem[1]+"="+(currentProblem[0]-currentProblem[1]))
                }
            }
        }
        if(isCorrect){
            scoreTally[0]+=1
            scoreTally[1]+=1
        }
        else {
            scoreTally[1]+=1
        }
        if(isPractice){
            $("#progressBarInner").css("width","0rem")
        }
        else {
            $("#progressBarInner").css("width",((scoreTally[1]/teacherSettings.quizProblems)*600)+"rem")
            if(scoreTally[1] == teacherSettings.quizProblems){
                leaveQuiz()
            }
        }
        nextQuestion()
    }
}

var resultsToSend = [];
function leaveQuiz(){
    appRunning = false;
    var currentTime = new Date().getTime();
    var diff = currentTime - startTime;
    var seconds = Math.floor(diff / 1000);
    var timeString = fancyTimeFormat2(seconds)
    var scoreString = "Score: " + scoreTally[0] + "/" + scoreTally[1]
    var percentageString = (Math.floor((scoreTally[0]/scoreTally[1])*100)||0)+"%"
    if(!isPractice){
        scoreString = "Score: " + scoreTally[0] + "/" + teacherSettings.quizProblems
        percentageString = (Math.floor((scoreTally[0]/teacherSettings.quizProblems)*100)||0)+"%"
    }
    var levelString = "Level " + selectedLevel
    var hasPassed = true;
    if(!isPractice){hasPassed = (Math.floor((scoreTally[0]/teacherSettings.quizProblems)*100)||0) >= teacherSettings.passingPercentage}
    if(!gameRunning) changeScreen("quizFinishScreen");
    $("#quizFinishData").html(levelString + "<br>" + timeString + "<br>" + scoreString + "<br>" + percentageString)
    var f = !isPractice?"Test":"Practice"
    $("#quizFinishTitle").html(selectedQuizType + " " + f)

    if(isPractice){
        $("#quizFinishBanner").html("Good practice!")
        $("#quizFinishBanner").css("background", "#1CA805")
    }
    else {
        if(hasPassed){
            $("#quizFinishBanner").html("You passed!")
            $("#quizFinishBanner").css("background", "#1CA805")
        }
        else {
            $("#quizFinishBanner").html("You'll get it next time!")
            $("#quizFinishBanner").css("background", "#FF5E5E")
        }
    }
    var type;
    if(isPractice){
        if(selectedQuizType == "Addition"){
            type = "Add. Pract."
        }
        else {
            type = "Subt. Pract."
        }
    }
    else {
        if(selectedQuizType == "Addition"){
            type = "Add. Test"
        }
        else {
            type = "Subt. Test"
        }
    }
    var uid = uniqueId()
    if((hasPassed&&!isPractice) || seconds >= 15){
        var totalProblems = scoreTally[1]
        if(!isPractice){
            totalProblems = teacherSettings.quizProblems
        }
        var result = [uid,myName,type,selectedLevel,seconds,scoreTally[0],totalProblems,hasPassed,false,Date.now()]
        saveToLocalStudentResults(result)
        if(!offlineMode){
            resultsToSend.push({resultId: uid, result: result, tries: 0})
            uploadResults()
        }
        if(selectedQuizType == "Addition" && selectedLevel > myMaxAdditionLevel) myMaxAdditionLevel = selectedLevel;
        else if (selectedQuizType == "Subtraction" && selectedLevel > myMaxSubtractionLevel) myMaxSubtractionLevel = selectedLevel;
        updateTopRight();
    }
}

function uploadResults(){
    var noProblems = true;
    for(let i = 0; i < resultsToSend.length; i++){
        var resultWrapper = resultsToSend[i];
        var result = resultWrapper.result;
        resultWrapper.tries++;
        if(resultWrapper.tries > 2){
            showWarningBanner()
            noProblems = false;
        }
        uploadResult(result)
    }
    if(noProblems && !offlineMode){
        $("#resultNotSentBar").css("display","none");
    }
}

function showWarningBanner(){
    $("#resultNotSentBar").css("display","block");
}

function showUnsentResults(){
    $("#copyContainer").css("display","flex")
    $("#copyButton").html("Copy to clipboard")
    $("#copyPage").html("")

    var unsentResultIds = {}

    if(!offlineMode){
        $("#copyPage").append("          =====================================================\n")
        $("#copyPage").append("          |                  Unsent Results                   |\n")
        $("#copyPage").append("          =====================================================\n\n")
        for(let i = resultsToSend.length-1; i >= 0; i--){
            var record = resultsToSend[i].result
            var name = record[1]
            var type = record[2]
            var level = record[3]
            var seconds = record[4]
            var ftime = fancyTimeFormat2(seconds)
            var correct = record[5]
            var total = record[6]
            var score = correct+"/"+total
            var percentage = (Math.round((correct/total)*100)||0)+"%"
            var passed = record[7]
            unsentResultIds[record[0]] = true;
            var symbolToShow = "F"
            if(passed){
                symbolToShow = "P"
            }
            if(type == "Add. Pract." || type == "Subt. Pract."){symbolToShow = " "}
            var date = new Date(record[9]);

            $("#copyPage").append("------------------" + date + "------------------\n")
            $("#copyPage").append(symbolToShow + "  " + cutText(name, 20) + "     " + cutText(type, 15) + "   ")
            $("#copyPage").append("Level " + cutText(level, 3) + "     " + cutText(ftime, 8) + "   ")
            $("#copyPage").append(cutText(score, 6) + "     " + cutText(percentage, 4) + "\n\n")
        }
        $("#copyPage").append("\n\n")
    }
    $("#copyPage").append("          =====================================================\n")
    $("#copyPage").append("          |             Past results on this device           |\n")
    $("#copyPage").append("          =====================================================\n\n")
    if(!localStorageExists){
        $("#copyPage").append("\nSorry, local storage doesn't work on this device!\nAvoid using incognito mode and old browser versions.")
        return;
    }
    var localStudentResults = getLocalStudentResults()
    for(let i = 0; i < localStudentResults.length; i++){
        var record = localStudentResults[i]
        if(unsentResultIds[record[0]] == true){
            continue;
        }
        var name = record[1]
        var type = record[2]
        var level = record[3]
        var seconds = record[4]
        var ftime = fancyTimeFormat2(seconds)
        var correct = record[5]
        var total = record[6]
        var score = correct+"/"+total
        var percentage = (Math.round((correct/total)*100)||0)+"%"
        var passed = record[7]
        var symbolToShow = "F"
        if(passed){
            symbolToShow = "P"
        }
        if(type == "Add. Pract." || type == "Subt. Pract."){symbolToShow = " "}
        var date = new Date(record[9]);

        $("#copyPage").append("------------------" + date + "------------------\n")
        $("#copyPage").append(symbolToShow + "  " + cutText(name, 20) + "     " + cutText(type, 15) + "   ")
        $("#copyPage").append("Level " + cutText(level, 3) + "     " + cutText(ftime, 8) + "   ")
        $("#copyPage").append(cutText(score, 6) + "     " + cutText(percentage, 4) + "\n\n")
    }
}

function fancyTimeFormat(duration) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
  
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
  
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
  
    return ret;
  }
  function fancyTimeFormat2(duration) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
  
    if (hrs > 0) {
      ret += "" + hrs + "h" + (mins < 10 ? "0" : "");
    }
  
    ret += "" + mins + "m" + (secs < 10 ? "0" : "");
    ret += "" + secs + "s";
  
    return ret;
  }

  var lastTick = Date.now();
  function tick(){
    var currentTime = Date.now()
    var delta = (currentTime-lastTick)/10;
    lastTick = currentTime;
    if(gameRunning){
        doGameTick(delta);
    }

    if(appRunning && !isPractice){
        var diff = currentTime - startTime;
        var seconds = Math.floor(diff / 1000);
        $("#timeBanner").html((teacherSettings.timeLimit - seconds) + "s")
        if(teacherSettings.timeLimit - seconds <= 0){
            leaveQuiz()
        }
    }
    window.requestAnimationFrame(tick)
  }

  const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
  };