const express = require('express');
var app = express();

const db = require('./config/mongoserver.js');


db.on('connected', function () {
    console.log('Connected to CHAT DB');
});


var users = [];
var available = [];
var chatsessions = {};

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

/* Listener */

myEmitter.on('save', (d) => {
    chatDB.saveMessage(chatsessions[d.room][d.user],d.user);
    chatsessions[d.room][d.user] = [];
});



myEmitter.on('fetch', (room) => {


    chatDB.getMessage(room)
        .then(function(d){
            room.socket.emit('got old',d); 
        })
        .catch(function(e){
            console.log('ERROR IN FETCH ', e);
    });


});
/***********************/

const chatDB = require('./app/model/chat');


const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
var moment = require('moment');

var timestamp;


app.use(express.static(path.join(__dirname  + '/app/public')));

app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/app/views/index.html'));
});


server = http.createServer(app);
io = socketIO(server);


io.on('connection', function(socket) {
    
/* Available users */
    
    socket.on('avail user', function (d) {
        available.push({id:socket.id, name:d.user});
        io.emit('new avail', available);
    });
    
    socket.on('unavail user', function (d) {

        var index;
        available.forEach(function (v,i){
            if(d.user == v.name){
                index = i;
            }
                
        });
        available.splice(index,1);
        io.emit('new avail', available);
//        console.log(d.req);
        
        if(d.req != undefined) {
            
            var socketID;
            available.forEach(function (v,i){
                if(d.req == v.name)
                    socketID = v.id;
            });        

            io.to(socketID).emit('new req', d.user);
            
        } else {
            
            socket.emit('clear req');
        }
        

        
        
    })
    
/*Saving username in socket on connection*/
    
    socket.on('notify', function(data,callback) {
        if (data.user1.trim().length == 0 || data.user2.trim().length == 0)
            callback('Enter Valid usernames!');
        if( users.indexOf(data.user1) == -1)
            users.push(data.user1);
        else
            callback('User can only be in one chat at a time!');

        socket.userName = data.user1;

        if (data.user1.localeCompare(data.user2) < 0) {
            socket.join(data.user1+'_'+data.user2);
            socket.room = data.user1+'_'+data.user2;
            if(!chatsessions.hasOwnProperty(socket.room)){
                chatsessions[socket.room] = {};                
                chatsessions[socket.room][socket.userName] = [];
                chatsessions[socket.room][data.user2] = [];
            }
        }else{
            socket.join(data.user2+'_'+data.user1);
            socket.room = data.user2+'_'+data.user1;
            if(!chatsessions.hasOwnProperty(socket.room)){
                chatsessions[socket.room] = {};
                chatsessions[socket.room][socket.userName] = [];
                chatsessions[socket.room][data.user2] = [];
            }
        }

        

        
        timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
        socket.emit('new user', {
            name: data.user1,
            time: timestamp,
            welcome: true
        });
        socket.broadcast.to(socket.room).emit('new user', {
            name: data.user1,
            time: timestamp,
            welcome: false
        });
    });
    
    socket.on('new message', function(data){
        timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");

        for(var u in chatsessions[socket.room]){

            chatsessions[socket.room][u].push({
                    room: socket.room,
                    user: data.user,
                    msg: data.msg,
                    timestamp: timestamp
                }); 

            if(users.indexOf(u) == -1){
//

                myEmitter.emit('save', {room: socket.room, user: u});
//
            }
        }
        

        
        io.to(socket.room).emit('add message', { 
            user: data.user,
            message: data.msg,
            time: timestamp
        });        
    });
    
    socket.on('get old',function() {
//

        myEmitter.emit('fetch', {room: socket.room, socket: socket});

//        
    });
    
    socket.on('disconnect', function() {

//if browser closes on first page
        var index;
        available.forEach(function (v,i){
            if(socket.id == v.id){
                index = i;
            }
                
        });

        if(index != undefined){
            available.splice(index,1);
            io.emit('new avail', available);
        }
//

        var i = users.indexOf(socket.userName);
        if(i != -1){
            users.splice(i,1);
            //
            myEmitter.emit('save', {room: socket.room, user: socket.userName});
            //
            timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
            socket.broadcast.to(socket.room).emit('user left', {
                name: socket.userName,
                time: timestamp
            });
        }
    });
    
    
    

    
/*typing logic */
    
     socket.on('typing', function (data) {
         if(data)
            socket.broadcast.to(socket.room).emit('usertyping', socket.userName);
         else
             socket.broadcast.to(socket.room).emit('usertyping', false);
             
    });
});

server.listen(3000, function() {
    console.log('Listening to 3000 port');
})