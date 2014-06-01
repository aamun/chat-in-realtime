// Angular way ej: https://www.youtube.com/watch?v=6bXpq1xiDsQ

// app.js
var app = angular.module('chatApp', ['ngRoute', 'chatControllers', 'luegg.directives']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/', {
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
    }).
    when('/chatroom', {
        templateUrl: 'partials/chatroom.html',
        controller: 'ChatCtrl'
    }).
    otherwise({
        redirecTo: '/'
    });
}]);

// Controllers

// controllers.js
var chatControllers = angular.module('chatControllers', []);

// Socket factory
// Notice that we wrap each socket callback in $scope.$apply. 
// This tells AngularJS that it needs to check the state of 
// the application and update the templates if there was a 
// change after running the callback passed to it. Internally, 
// $http works in the same way; after some XHR returns, 
// it calls $scope.$apply, so that AngularJS can update its 
// views accordingly.
chatControllers.factory('socket', ['$rootScope',function ($rootScope) {
  var socket = io.connect('/');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () { // Tell 
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    send: function(message){
        socket.send(message);
    }
  };
}]);

// Messages factory
chatControllers.factory('messages', function(){
    return [];
});

// User factory
chatControllers.factory('user', function(){
    return {nickname : ''};
});

// Main Controller
chatControllers.controller('MainCtrl', function($scope, $location, socket, user, messages){

    $scope.messages = messages;
    $scope.user = user;

    // Init (Login) user set nickname
    socket.on("init", function(user){
        var message = {
            text: 'Hello ' + user.name,
            type: 'systemMessage'
        };

        // Redirect to chatroom
        $location.path('/chatroom');

        $scope.messages.push(message);
    });

    // Handle message event 
    socket.on("message", function(message){
        message = JSON.parse(message);
        $scope.messages.push(message);
    });

    // Handle user:join event 
    socket.on("user:join", function(user){
        var message = {
            text: user.name + ' has joined the room.',
            type: 'systemMessage'
        };
        $scope.messages.push(message);
    });
});

// Index Controller child of Main Controller
chatControllers.controller('IndexCtrl', function($scope, $location, socket){

    $scope.setName = function(){
        socket.emit('change:name', {name: $scope.user.nickname});
    };
});

// Chat Controller child of Main Controller
chatControllers.controller('ChatCtrl', function($scope, $location, socket){
    
    if ($scope.user.nickname === '') {
        $location.path('/');
    }

    $scope.sendMsg = function(){
        var message = {
            text : $scope.message.text,
            type: 'userMessage'
        };
        socket.send(JSON.stringify(message));
        $scope.message.text = '';
    };
});