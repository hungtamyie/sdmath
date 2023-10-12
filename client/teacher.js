var showingHidden;

var studentRecords = [
    //RecordId, Name, Type, Level, Seconds taken, Problems correct, Total problems, Passed, isHidden
]

function displayRecords(filter,showHidden){
    $("#tableContentContainer").html("")
    var recordsAdded = 0;
    $("#sortWarning").css("display","none")
    if(filter){
        $("#sortWarning").css("display","block")
        $("#sortWarningText").html("Showing student \"" + filter + "\" results")
    }
    if(showHidden){
        $("#sortWarning").css("display","block")
        $("#sortWarningText").html("Showing hidden results")
    }
    var hiddenResultsCount = 0;
    for(let i = 0; i < studentRecords.length; i++){
        if(studentRecords[i][8]) hiddenResultsCount++
        if((!studentRecords[i][8]&&!showHidden)||(studentRecords[i][8]&&showHidden)){
            var record = studentRecords[i]
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
            var rowId = "row_"+record[0]
            var symbolToShow = '<div class="x shiftDown"></div>'
            if(passed){
                symbolToShow = '<div class="check shiftDown"></div>'
            }
            if(type=="Add. Pract." || type=="Sub. Pract."){
                symbolToShow = ""
            }

            var hideButton = '<div class="button" onclick="hideRow(\''+ record[0] + '\')">hide</div>'
            if(showHidden){
                hideButton = '<div class="button" onclick="unhideRow(\''+ record[0] + '\')">restore</div>'
            }

            if(checkboxes[0]==false && passed==true) continue;
            if(checkboxes[1]==false && passed==false) continue;
            if(checkboxes[2]==false && (type=="Add. Pract." || type=="Add. Test")) continue;
            if(checkboxes[3]==false && (type=="Subt. Pract." || type=="Subt. Test")) continue;
            if(checkboxes[4]==false && (type=="Add. Test" || type=="Subt. Test")) continue;
            if(checkboxes[5]==false && (type=="Subt. Pract." || type=="Add. Pract.")) continue;
            if(currentStudentFilter != "" && !(name.toLowerCase()).startsWith(currentStudentFilter.toLowerCase())) continue;

            $("#tableContentContainer").append('<div class="tableRow" id="'+rowId+'">\
                <div class="t0">'+symbolToShow+'</div>\
                <div class="t1">'+name+'</div>\
                <div class="t2">' + type +'</div>\
                <div class="t3">Lvl '+ level +'</div>\
                <div class="t4">' + ftime + '</div>\
                <div class="t5">'+score+'</div>\
                <div class="t6">'+percentage+'</div>\
                <div class="t7">'+hideButton+'</div>\
            </div>')
            if(record[0] == mostRecentResultLineId && i != studentRecords.length-1){
                $("#tableContentContainer").append('<div class="tableDividerRed"></div>')
                $("#tableContentContainer").append('<div class="tableDividerRed"></div>')
                $(".tableDividerRed").fadeOut(3000, function() {
                    $(this).remove();
                    mostRecentResultLineId = "!!!!!!!!!!!!!!"
                });
            }
            recordsAdded++;
        }
        $("#resultsHiddenButton").html(hiddenResultsCount + " Results Hidden <div class='magnify'></div>")
    }
    while(recordsAdded < 18){
        $("#tableContentContainer").append('<div class="tableRow"></div')
        recordsAdded++;
    }
    for(let i = 0; i < 4; i++){
        $("#tableContentContainer").append('<div class="tableRow"></div')
    }
}

function hideRow(id){
    for(let i = 0; i < studentRecords.length; i++){
        if(studentRecords[i][0] == id){
            studentRecords[i][8]=true;
            break;
        }
    }
    displayRecords(currentStudentFilter,showingHidden);
}

function unhideRow(id){
    for(let i = 0; i < studentRecords.length; i++){
        if(studentRecords[i][0] == id){
            studentRecords[i][8]=false;
            break;
        }
    }
    displayRecords(currentStudentFilter,showingHidden);
}

var currentStudentFilter = ""
function activateTeacherButtons(){
    $("#resultsHiddenButton").click(function(){
        if(showingHidden){
            showingHidden = false;
            $("#tableContainer").removeClass("hiddenResults")
            $("#getCopyButton").css("display","block")
        }
        else {
            showingHidden = true;
            $("#tableContainer").addClass("hiddenResults")
            $("#getCopyButton").css("display","none")
        }
        displayRecords(currentStudentFilter,showingHidden);
    })
}

function hideSortWarning(){
    currentStudentFilter = ""
    $("#studentNameInput").val("");
    showingHidden = false;
    $("#tableContainer").removeClass("hiddenResults")
    displayRecords(currentStudentFilter,false);
}

var checkboxes = [
    true,true,true,true,true,true
]
function checkboxClicked(num){
    checkboxes[num] = !checkboxes[num]
    for(let i = 0; i < 6; i++){
        if(checkboxes[i]==false){
            $("#checkbox" + i).removeClass("checked")
        }
        else {
            $("#checkbox" + i).addClass("checked")
        }
    }
    updateShowNewButton()
    displayRecords(currentStudentFilter);
}

function getCopy(){
    if(showingHidden) return;
    $("#copyContainer").css("display","flex")
    $("#copyPage").html("")
    for(let i = 0; i < studentRecords.length; i++){
        var record = studentRecords[i]
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
        var rowId = "row_"+record[0]
        var symbolToShow = "F"
        if(passed){
            symbolToShow = "P"
        }
        if(type == "Add. Pract." || type == "Subt. Pract."){symbolToShow = " "}


        if(studentRecords[i][8]) continue;
        if(checkboxes[0]==false && passed==true) continue;
        if(checkboxes[1]==false && passed==false) continue;
        if(checkboxes[2]==false && (type=="Add. Pract." || type=="Add. Test")) continue;
        if(checkboxes[3]==false && (type=="Subt. Pract." || type=="Subt. Test")) continue;
        if(checkboxes[4]==false && (type=="Add. Test" || type=="Subt. Test")) continue;
        if(checkboxes[5]==false && (type=="Subt. Pract." || type=="Add. Pract.")) continue;
        if(currentStudentFilter != "" && !(name.toLowerCase()).startsWith(currentStudentFilter.toLowerCase())) continue;

        $("#copyPage").append(symbolToShow + "  " + cutText(name, 20) + "     " + cutText(type, 15) + "   ")
        $("#copyPage").append("Level " + cutText(level, 3) + "     " + cutText(ftime, 8) + "   ")
        $("#copyPage").append(cutText(score, 9) + "     " + cutText(percentage, 4) + "\n")
        $("#copyButton").html("Copy to clipboard")
    }
}

function cutText(text, width){
    text = String(text)
    if(text.length > width){
        return text.substring(0,width-1)+"."
    }
    else {
        return text.padEnd(width, " ")
    }
}

function CopyToClipboard(id)
{
    var r = document.createRange();
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    $("#copyButton").html("Copied!")
}

function closeCopyContainer(){
    $("#copyContainer").css("display","none");
    $("#copyButton").html("Copy to clipboard");
}

function searchStudents(){
    currentStudentFilter = $("#studentNameInput").val()
    displayRecords(currentStudentFilter,showingHidden);
}

function clearStudentSearch(){
    $("#studentNameInput").val("");
    currentStudentFilter = "";
    displayRecords(currentStudentFilter,showingHidden);
}

var mostRecentResultLineId = "";
var newResultsQueue = []
function showNew(){
    for(let i = 0; i < newResultsQueue.length; i++){
        result = newResultsQueue[i]
        saveToLocalStorage(result)
        studentRecords.unshift(result)
        if(i == 0){
            mostRecentResultLineId = result[0]
        }
    }
    $('#tableContentContainer').scrollTop(0);
    newResultsQueue = [];
    $("#showNewButton").addClass("notActive");
    $("#showNewButton").removeClass("button");
    $("#showNewButton").html("Waiting...")
    displayRecords(currentStudentFilter,showingHidden);
}

var wantsCorrectionsMidTest = false
function changeYN(type){
    if(type=="Yes"){
        wantsCorrectionsMidTest = true;
        $("#ynn").addClass("ynN")
        $("#yny").removeClass("ynN")
    }
    else {
        wantsCorrectionsMidTest = false;
        $("#yny").addClass("ynN")
        $("#ynn").removeClass("ynN")
    }
}

function showTeacherPassword(){
    $("#teacherPasswordContainer").css("visibility","visible")
    $("#teacherPassword").focus()
}
function tryTeacherPassword(){
    if($("#teacherPassword").val() == "yaymath!"){
        changeScreen("teacherLoginScreen");
    }
    $("#teacherPassword").val("")
    $("#teacherPasswordContainer").css("visibility","hidden")
}