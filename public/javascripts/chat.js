// Angular way ej: https://www.youtube.com/watch?v=6bXpq1xiDsQ
var app = angular.module('awesomeChat', []);

app.factory('socket', function(){
    var socket = io.connect('/');
    return socket;
});

app.controller('ChatCtrl', function($scope, socket){
    $scope.messages = [];

    $scope.sendMsg = function(){
        var data = {
            text : $scope.message.text,
            type: 'userMessage'
        };
        socket.send(JSON.stringify(data));
        $scope.message.text = '';
    };

    socket.on("message", function(data){
        data = JSON.parse(data);
        $scope.messages.push(data);
        $scope.$digest();
    });
});


// jQuery way

// var socket = io.connect('/');

// socket.on("message", function(data){
//     data = JSON.parse(data);
//     $("#messages").append('<div class="'+data.type+'">'+data.message+'</div>');
// });

// $(function(){

//     var inputMessage = $("#message");

//     $("#send").click(function(){
//         var data = {
//             message : inputMessage.val(),
//             type: 'userMessage'
//         };

//         socket.send(JSON.stringify(data));

//         inputMessage.val('');
//     });
// });