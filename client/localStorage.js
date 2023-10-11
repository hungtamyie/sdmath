var localStorageExists = false;
function checkLocalStorage(){
    if(window.localStorage){
        if(!localStorage.getItem("teacherResults")){
            localStorage.setItem("teacherResults", "[]")
        }
        if(!localStorage.getItem("studentResults")){
            localStorage.setItem("studentResults", "[]")
        }
        localStorageExists = true;
        loadRoomSettings();
    }
    else {
        $("#showStudentsButton").addClass("notActive");
        $("#showStudentsButton").removeClass("button");
        $("#showStudentsButton").html("NO_LOCAL_STORAGE")
    }
}

function saveToLocalStorage(data){
    if(!localStorageExists) return;
    var localResultsArray = [];
    localResultsArray = JSON.parse(localStorage.getItem("teacherResults"))
    localResultsArray.push(data)
    localStorage.setItem("teacherResults", JSON.stringify(localResultsArray))
}

function restoreFromLocalStorage(){
    if(!localStorageExists) return;
    var currentTime = Date.now()
    var localResultsArray = JSON.parse(localStorage.getItem("teacherResults"))
    if(!localResultsArray) return;
    localResultsArray = localResultsArray.filter(function(item) {
        return (currentTime-item[9])<86400000 //1 day in milliseconds
    })
    localStorage.setItem("teacherResults",JSON.stringify(localResultsArray))
    studentRecords = []
    for(let i = 0; i < localResultsArray.length; i++){
        localResultsArray[i][8]=false;
        studentRecords.unshift(localResultsArray[i]);
    }
    displayRecords(currentStudentFilter,showingHidden);
}

function newResult(result){
    newResultsQueue.push(result)
    updateShowNewButton()
}

function saveToLocalStudentResults(data){
    if(!localStorageExists) return;
    var localResultsArray = [];
    localResultsArray = JSON.parse(localStorage.getItem("studentResults"))
    localResultsArray.unshift(data)
    if(localResultsArray.length > 100){
        localResultsArray = localResultsArray.slice(0,100);
    }
    localStorage.setItem("studentResults", JSON.stringify(localResultsArray))
}

function getLocalStudentResults(){
    if(!localStorageExists) return;
    var localResultsArray = JSON.parse(localStorage.getItem("studentResults"));
    return localResultsArray;
}

function updateShowNewButton(){
    for(let i= 0; i < newResultsQueue.length; i++){
        var record = newResultsQueue[i]
        var name = record[1]
        var type = record[2]
        var passed = record[7]
        
        var isShown = true;
        if(newResultsQueue[i][8]) isShown = false;
        if(checkboxes[0]==false && passed==true) isShown = false;
        if(checkboxes[1]==false && passed==false) isShown = false;
        if(checkboxes[2]==false && (type=="Add. Pract." || type=="Add. Test")) isShown = false;
        if(checkboxes[3]==false && (type=="Subt. Pract." || type=="Subt. Test")) isShown = false;
        if(checkboxes[4]==false && (type=="Add. Test" || type=="Subt. Test")) isShown = false;
        if(checkboxes[5]==false && (type=="Subt. Pract." || type=="Add. Pract.")) isShown = false;
        if(currentStudentFilter != "" && !(name.toLowerCase()).startsWith(currentStudentFilter.toLowerCase())) isShown = false;
        if(isShown == true){
            $("#showNewButton").addClass("button");
            $("#showNewButton").removeClass("notActive");
            $("#showNewButton").html("Show new!")
            return;
        }
    }
    $("#showNewButton").addClass("notActive");
    $("#showNewButton").removeClass("button");
    $("#showNewButton").html("Waiting...")
}

function saveRoomSettings(data){
    if(!localStorageExists) return;
    var dataString = JSON.stringify(data)
    localStorage.setItem("roomSettings", dataString);
}

function loadRoomSettings(){
    if(!localStorageExists) return;
    var data = JSON.parse(localStorage.getItem("roomSettings"))
    if(!data) return
    $("#teacherCodeInput").val(data.roomCode)
    $("#teacherNameInput").val(data.teacherName)
    $("#percentageToPassInput").val(data.percentToPass)
    $("#timeLimitInput").val(data.timeLimit)
    $("#numOfProblemsInput").val(data.numberOfProblems)
    if(data.corrections){
        changeYN("Yes")
    }
    else {
        changeYN("No")
    }
}