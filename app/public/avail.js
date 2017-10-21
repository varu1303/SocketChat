$(document).ready(function() {
    
    var socket = io();
    
    $("#exampleInputName2").prop('readonly', true);
    $("#exampleInputEmail2").prop('disabled', true);
    
    $("#main-read").on('keyup', function () {
        if ($("#main-read").val().length > 0){
            $("#log-btn").attr('disabled', false);        
        }        
    })



    
    $("#log-btn").on('click', function () {

        $("#out-btn").attr('disabled', false);
        $("#join-btn").attr('disabled', false);
        $("#log-btn").attr('disabled', true);
        $("#main-read").prop('disabled', true);
        $("#exampleInputEmail2").prop('disabled', false);
        $("#exampleInputName2").val($("#main-read").val());
        
        socket.emit('avail user', {user: $("#main-read").val()});
    })
    
    $("#out-btn").on('click', function () {
        
        var u = $("#main-read").val();
        $("#out-btn").attr('disabled', true);
        $("#join-btn").attr('disabled', true);
        $("#log-btn").attr('disabled', false);
        $("#main-read").prop('disabled', false);
        $("#main-read").val('');
        $("#exampleInputName2").val('');
        $("#log-btn").attr('disabled', true); 
        $("#exampleInputEmail2").prop('disabled', true);
        socket.emit('unavail user', {user: u});
    })
    
    $("#join-btn").on('click', function() {
        socket.emit('unavail user', {user: $("#main-read").val(), req: $("#exampleInputEmail2").val()});        
    })
    
    socket.on('new req', function(d) {

        $("#req-list ul").append('<li>'+d+' has requested a chat with you!</li>');

    })
    
    socket.on('clear req', function () {
         $("#req-list ul").empty();
    })
    
    socket.on('new avail', function(d) {
        $("#avail-list ul").empty();
        $("#avail-list h3").text('Available Users: '+ d.length);
        $.each(d, function(i, v) {
            $("#avail-list ul").append('<li>'+v.name+'</li>');
        })
    })
    
    
    
    
});