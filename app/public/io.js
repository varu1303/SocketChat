$(document).ready(function () {
    
    var send = $("#send");
    var messageEntry = $("#msg");
    var input = $("#Input");
    var load = $("#load");
    var loader = [];
    var i,x;
    var first = true;
    var searchData = $.deparam(window.location.search);

    var user1 = searchData.user1;
    var user2 = searchData.user2;
    var timeout=undefined;
    var typing = true;
/*Scrolling function */    
    function autoScroll () {
        var ch = messageEntry.prop('clientHeight');
        var st = messageEntry.prop('scrollTop');
        var sh = messageEntry.prop('scrollHeight');
        var liHeight = messageEntry.children('li:last-child').innerHeight();
        
        if(ch+st+liHeight+liHeight >= sh) {
            messageEntry.stop().animate({scrollTop: sh}, 1000);
        }
    }
    
    var socket = io();
    
    $(document).keypress(function(e) {
        var messageText = input.val();
        if(e.which == 13 && messageText != "") {
            clearTimeout(timeout);
            userTyping();
            socket.emit('new message',{
                user:user1,
                msg:messageText
            });
            $("#Input").val("");
        }
    });
    
    send.on('click', function() {
        var messageText = input.val();
        if(messageText != "") {
            clearTimeout(timeout);
            userTyping();
            socket.emit('new message',{
                user:user1,
                msg:messageText
            });
            $("#Input").val("");
        }
        
    });
    
    load.on('click', function() {
        if (first){
            first = false;
            socket.emit('get old');            
        }
        else{
            for(i = 0; i < 10; i++) {
                if(loader[x] == undefined){
                    i=10;
                    load.attr("disabled",true);
                } else {
                    messageEntry.prepend('<li>'+'<span class="time">'+'@'+loader[x].tStamp+'</span>'+'<span class="user">'+' '+loader[x].user+'</span>'+':'+loader[x].msg+'</li>'); 
                    ++x;                    
                }

            }
        }
            
        
    })
    
    socket.on('got old', function (array) {
        console.log('unloading');
        loader = array;
        x= 10;
        for (i=0; i<10; i++){
            if(loader[i] == undefined){
                i=10;
                load.attr("disabled",true);
            } else {
                messageEntry.prepend('<li>'+'<span class="time">'+'@'+loader[i].tStamp+'</span>'+'<span class="user">'+' '+loader[i].user+'</span>'+':'+loader[i].msg+'</li>');                 
            }
           
        }

    })
    
    socket.on('add message', function(data) {
        messageEntry.append('<li>'+'<span class="time">'+'@'+data.time+'</span>'+'<span class="user">'+' '+data.user+'</span>'+':'+data.message+'</li>');
        autoScroll();
    });

/*Printing welcome message on connection */
    socket.on('connect', function() {
        socket.emit('notify', {
            user1: user1,
            user2: user2
        },function (err) {
            if (err) {
                alert(err);
                window.location.href="http://localhost:3000/index.html";
            }
        });
    });
    
    socket.on('new user', function(data) {
        if (data.welcome) {
            messageEntry.append('<li>'+'<span class="time">'+'@'+data.time+'</span>'+' '+'WELCOME '+'<span class="user">'+ data.name+' '+'</span>'+'</li>');
            autoScroll(); 
        } else {
            messageEntry.append('<li>'+'<span class="time">'+'@'+data.time+'</span>'+'<span class="user">'+' '+ data.name +' '+'</span>'+'has joined! '+'</li>');
            autoScroll();            
        }

    });
    
    socket.on('user left', function(data) {
        messageEntry.append('<li>'+'<span class="time">'+'@'+data.time+'</span>'+'<span class="user">'+' '+ data.name +' '+'</span>'+'has left! '+'</li>');
        autoScroll();
    });
    
    socket.on('disconnect', function() {
            console.log('disconnected');
    });
    
/*typing or not notification */
    

    
    function userTyping () {
        
        typing = false;
        socket.emit('typing', false);
        
    }
    
    $("#Input").keyup(function(e) {
        if (timeout == undefined && e.which != 13)
           socket.emit('typing', true); 
        if(typing == false && e.which != 13){
            typing = true;
            socket.emit('typing', true);
            clearTimeout(timeout);
            timeout = setTimeout(userTyping, 2000);            
        }else{
            clearTimeout(timeout);
            timeout = setTimeout(userTyping, 2000);               
        }
    });
    
    
    
    socket.on('usertyping', function (data) {
        if(data){
            messageEntry.append('<li id="'+data+'">'+'<span class="user">'+ data +' '+'</span>'+'is typing......'+'</li>');
            autoScroll();
        }
        else
           $("#"+user2).remove();  
    });
    
});