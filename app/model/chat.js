const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var chatSchema = mongoose.Schema({
    room : {
        type: String,
        required: true
    },
    user : String,
    owner : String,
    msg : String,
    tStamp : String,
});


chatMessage = mongoose.model('chatMessage', chatSchema);

module.exports = {
    
    saveMessage: function (data,owner) {

        var e = false;
        data.forEach(function(v,i) {
            var message = new chatMessage({
                room : v.room,
                user : v.user,
                owner : owner,
                msg  : v.msg,
                tStamp : v.timestamp
            });

            message.save()
                .then(function() {
                    console.log('SAVED!')
            })
                .catch(function(){
                    e = true;
                    console.log('ERROR IN SAVING');
            });
        });
        
        return e;

    },
    
    getMessage : function (r) {
        return chatMessage.find({room : r.room, owner: r.socket.userName})
            .sort({ _id: -1 });

    }
};