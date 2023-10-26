var socket = io();
var myName;
var myRoom;

socket.on('connect', function(){
    if(teacherSettings.teacherName){
        $("#connectionStatus").html("Connected to " + makePossesive(teacherSettings.teacherName) + " room")
        $("#connectionStatus").removeClass("disconnected")
    }
    if(offlineMode){
        $("#connectionStatus").html("Offline mode")
        $("#connectionStatus").addClass("disconnected")
    }

    //TESTING
    window.setTimeout(() => {
        var data = {
            name: "mdrLOL",
            roomCode: "1111",
        }
        $("#studentName").html(data.name.trim())
        myName = data.name.trim()
        socket.emit("studentJoin", data)
    }, 500);
});
socket.on("serverMessage",function(data){
    showServerMessage(data);
})
socket.on('disconnect', function(){
    if(teacherSettings.teacherName){
        $("#connectionStatus").html("Disconnected from " + makePossesive(teacherSettings.teacherName) + " room")
        $("#connectionStatus").addClass("disconnected")
    }
    if(offlineMode){
        $("#connectionStatus").html("Offline mode")
        $("#connectionStatus").addClass("disconnected")
    }
})
socket.on("roomCreated",function(data){
    teacherSettings.teacherName = $("#studentName").html()
    saveRoomSettings(data)
    showStudentBanner()
    $("#roomCodeBox").html("#" + data.roomCode)
    changeScreen("teacherScreen")
})
socket.on("roomJoined",function(data){
    teacherSettings.quizProblems = data.numberOfProblems;
    teacherSettings.timeLimit = data.timeLimit;
    teacherSettings.correctionsMidTest = data.corrections;
    teacherSettings.passingPercentage = data.percentToPass;
    teacherSettings.teacherName = data.teacherName;
    myRoom = "r" + data.roomCode;
    if(data.offlineMode){
        offlineMode = true;       
        $("#resultNotSentBar").css("display","block");
        $("#resultNotSentBar").css("background","#3591e7");
        $("#showMyResultsButton").css("background","#0245f0");
        $("#showMyResultsButton").html("Show results");
        $("#resultWarningMessage").html("You are in offline mode! No results will be sent to your teacher.")
    }
    showStudentBanner();
    changeScreen("levelSelectScreen");
    //TESTING
    changeScreen("gameScreen");
    gameRunning=true;
})
socket.on("gameUpdate",function(data){
    takeGameUpdate(JSON.parse(data));
})

var alreadyReceivedResults = {}
socket.on("studentResult",function(data){
    var resultId = data.result[0]
    socket.emit("studentResultReceived",{studentID: data.studentID, dataID: data.result[0]})
    if(alreadyReceivedResults[resultId]) return; //This result has been already received and student has sent it twice.
    alreadyReceivedResults[resultId] = true;
    newResult(data.result)
})
socket.on("yourResultReceived",function(data){
    for(let i = 0; i < resultsToSend.length; i++){
        if(data == resultsToSend[i].resultId){
            resultsToSend.splice(i,1);
        }
    }
})

function tryRoomCreate(){
    var data = {
        roomCode: $("#teacherCodeInput").val(),
        teacherName: $("#teacherNameInput").val(),
        percentToPass: $("#percentageToPassInput").val(),
        timeLimit: $("#timeLimitInput").val(),
        numberOfProblems: $("#numOfProblemsInput").val(),
        corrections: wantsCorrectionsMidTest,
    }
    $("#studentName").html(data.teacherName.trim())
    socket.emit("createRoom", data)
}

function uploadResult(result){
    socket.emit("newResult", result)
}



function tryStudentJoin(){
    var data = {
        name: $("#studentNameLoginInput").val(),
        roomCode: $("#studentCodeInput").val(),
    }
    $("#studentName").html(data.name.trim())
    myName = data.name.trim()
    socket.emit("studentJoin", data)
}

var messageNum = 0;
function showServerMessage(message){
    if($("#serverMessageContainer").children().length > 5){return}
    messageNum++
    var customDiv = $("<div/>", {id:"serverMessage"+messageNum});
    $("#serverMessageContainer").prepend(customDiv)
    customDiv.html(message)
    $("#serverMessage"+messageNum).fadeOut(5000, function() {
        $(this).remove();
    });
}

