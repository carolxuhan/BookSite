'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
  'ngRoute',
  'bookControllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  	when('/', {
  		templateUrl: 'partials/books.html',
  		controller: 'bookListCtrl'
  	}).
  	when('/book/:bookId', {
  		templateUrl: 'partials/reviews.html',
  		controller: 'bookReviewCtrl'
  	}).
    when('/user/:userId', {
      // alert(userId);
      templateUrl: 'partials/userhome.html',
      controller: 'userCtrl'
    }).
  	otherwise({redirectTo: '/'});
}]);