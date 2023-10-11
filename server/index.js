const express = require('express');
const app = express();
const serv = require('http').Server(app);
const path = require('path')

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/client/index.html'));
});
app.use(express.static(path.join(__dirname, '..', '/client')))

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

serv.listen(port, (error)=>{
    if(error) {
        console.log('Something went wrong', error)
    }
    else {
        console.log('Server is listening on port ' + port)
    }
});
const io = require('socket.io')(serv, {'pingInterval': 2000, 'pingTimeout': 5000});

io.on("connection", (socket) => {
    socket.myData = {}

    socket.on("createRoom", function(data){
        data.teacherName = data.teacherName.trim()
        data.roomCode = data.roomCode.trim()
        /*
        var data = {
        roomCode: $("#teacherCodeInput").val(),
        teacherName: $("#teacherNameInput").val(),
        percentToPass: $("#percentageToPassInput").val(),
        timeLimit: $("#timeLimitInput").val(),
        numberOfProblems: $("#numOfProblemsInput").val(),
        corrections: wantsCorrectionsMidTest,
    } */
        var regNumeric = /^\d+$/
        if(String(data.roomCode).length != 4){
            socket.emit("serverMessage","Your room code must be 4 digits")
            return;
        }
        if(regNumeric.test(data.roomCode) == false){
            socket.emit("serverMessage","Your room code must only contain numers.")
            return;
        }
        if(data.roomCode == "0000"){
            socket.emit("serverMessage","This room code is reserved for offline mode. Please select another.")
            return;
        }
        if(rooms["r"+data.roomCode]){
            socket.emit("serverMessage","Another teacher is using this room! Please try another code.")
            return;
        }
        if(data.teacherName.length < 2){
            socket.emit("serverMessage","Type in your teacher name. For example: Mr. Brown")
            return;
        }
        if(regNumeric.test(data.percentToPass) == false){
            socket.emit("serverMessage","Invalid percentage to pass. Your input should only contain numbers.")
            return;
        }
        if(Number(data.percentToPass) < 30 || Number(data.percentToPass) > 95){
            socket.emit("serverMessage","Percentage to pass must be a number between 30 and 95.")
            return;
        }
        if(regNumeric.test(data.timeLimit) == false){
            socket.emit("serverMessage","Invalid time limit. Your input should only contain numbers.")
            return;
        }
        if(Number(data.timeLimit) < 20 || Number(data.timeLimit) > 300){
            socket.emit("serverMessage","Time limit must be a number between 20 and 300.")
            return;
        }
        if(regNumeric.test(data.numberOfProblems) == false){
            socket.emit("serverMessage","Invalid number of problems. Your input should only contain numbers.")
            return;
        }
        if(Number(data.numberOfProblems) < 15 || Number(data.numberOfProblems) > 200){
            socket.emit("serverMessage","The number of problems should be between 15 and 200")
            return;
        }
        var roomID = "r"+data.roomCode
        rooms[roomID] = {
            data: data,
            teacher: socket.id
        }
        socket.emit("roomCreated",data)
        socket.myData.amTeacher = true
        socket.myData.myRoom = roomID
        socket.join(roomID)
    })

    socket.on("disconnect",function(data){
        if(socket.myData.amTeacher == true){
            delete rooms[socket.myData.myRoom]
        }
    })

    socket.on("newResult",function(data){
        socket.to(socket.myData.myRoom).emit("studentResult", {studentID: socket.id, result: data})
    })

    socket.on("studentResultReceived",function(data){
        socket.to(data.studentID).emit("yourResultReceived", data.dataID)
    })

    socket.on("studentJoin",function(data){
        data.name = data.name.trim()
        var regex = /^[a-zA-Z -]*$/;
        if(regex.test(data.name) == false){
            socket.emit("serverMessage","Your name can't have numbers or special characters!")
            return;
        }
        if(data.name.length < 4){
            socket.emit("serverMessage","Please enter your full name.")
            return;
        }
        if(!rooms["r"+data.roomCode] && data.roomCode != "0000"){
            socket.emit("serverMessage","This room does not exist. Ask your teacher for more details.")
            return;
        }

        var roomData;
        var roomID = "r"+data.roomCode;
        if(data.roomCode != "0000"){
            roomData = JSON.parse(JSON.stringify(rooms[roomID].data))
            roomData.offlineMode = false
        }
        else {
            roomData = {
                roomCode: "0000",
                teacherName: "offline",
                percentToPass: 80,
                timeLimit: 120,
                numberOfProblems: 40,
                corrections: false,
                offlineMode: true,
            }
        }
        socket.emit("roomJoined",roomData)
        socket.myData.amTeacher = false
        socket.myData.myRoom = roomID
    })
})

var rooms = {

}

function getActiveRooms() {
    const arr = Array.from(io.sockets.adapter.rooms);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);
    return res;
}

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

//Server tick
/*
const Utility = require("./utility");
const utility = new Utility;
var tickRate = 200;
function serverTick() {
    setTimeout(() => {
        //Delete empty game lobbies
        let gameRoomCount = 0;
        for (const key in gameRooms) {
            if (gameRooms.hasOwnProperty(key)) {
                gameRoomCount++;
                if(utility.objLength(gameRooms[key].players) == 0){
                    delete gameRooms[key];
                }
                else {
                    gameRooms[key].update();
                }
            }
        }
        if(gameRoomCount == 0){
            tickRate = 5000;
        }
        else {
            tickRate = 200;
        }
        serverTick(); 
    }, tickRate)
}
serverTick();
*/