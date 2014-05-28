var io = require('socket.io');

exports.initialize = function(server){
    io = io.listen(server);
    io.sockets.on("connection", function(socket){

        // When socket handle a message event
        socket.on("message", function(message){
            message = JSON.parse(message);
            if (message.type == 'userMessage') {

                // Get nickname
                socket.get('nickname', function(err, nickname){
                    // Set user nickname
                    message.username = nickname;
                    // Send message to all users
                    socket.broadcast.send(JSON.stringify(message));
                    // Change message type
                    message.type = 'myMessage';
                    // Send message to owner
                    socket.send(JSON.stringify(message));
                });
            }
        });

        // When socket handle a set_name event
        socket.on("set_name", function(data){
            // Set nickname
            socket.set('nickname', data.name, function(){
                // Emit a name_set event
                socket.emit('name_set', data);

                // Send wellcome message
                socket.send(JSON.stringify({
                    type: 'serverMessage',
                    text: 'Wellcome to the most interesting chat room on earth!'
                }));

                // Broadcast user_entered event
                socket.broadcast.emit('user_entered', data);
            });
        });
    });
};