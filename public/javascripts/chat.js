// Angular way ej: https://www.youtube.com/watch?v=6bXpq1xiDsQ
var app = angular.module('awesomeChat', ['ui.bootstrap']);

app.factory('socket', function(){
    var socket = io.connect('/');
    return socket;
});

app.controller('ChatCtrl', function($scope, socket, $modal){
    $scope.messages = [];

    var nameModal = $modal.open({
        templateUrl: 'nameModal.html',
        controller: nameModalCtrl,
        backdrop: 'static'
    });

    nameModal.result.then(function(nickname){
        $scope.nickname = nickname;
        socket.emit('set_name', {name: nickname});
    });

    $scope.sendMsg = function(){
        var message = {
            text : $scope.message.text,
            type: 'userMessage'
        };
        socket.send(JSON.stringify(message));
        $scope.message.text = '';
    };

    socket.on("name_set", function(user){
        var message = {
            text: 'Hello ' + user.name,
            type: 'systemMessage'
        };
        $scope.messages.push(message);
        $scope.$digest();

        // Handle message event 
        socket.on("message", function(message){
            message = JSON.parse(message);
            $scope.messages.push(message);
            $scope.$digest();
        });

        // Handle user_entered event 
        socket.on("user_entered", function(user){
            var message = {
                text: user.name + ' has joined the room.',
                type: 'systemMessage'
            };
            $scope.messages.push(message);
            $scope.$digest();
        });
    });
});

var nameModalCtrl = function($scope, $modalInstance){
    $scope.user = {
        nickname: ''
    };
    $scope.ok = function(){
        $modalInstance.close($scope.user.nickname);
    };
};


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