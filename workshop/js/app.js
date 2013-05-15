/* App Module */

angular.module('workshop',[]).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/logs', {templateUrl: 'workshop/html/log-list.html',   controller: LogCtrl}).
      when('/logs/:logId', {templateUrl: 'workshop/html/log-detail.html', controller: LogDetailCtrl}).
      otherwise({redirectTo: '/logs'});
}]);


/* Controllers */

function headerCtrl($scope) {
    $scope.hideNameInput = true;
}

function LogCtrl($scope) {

    $scope.logs = [
        {"id":"1", "status":"200", "message":"OK", "url":"http://ok.html", "date":"01/01/2013 00:00:00"},
        {"id":"2", "status":"200", "message":"OK", "url":"http://ok.html", "date":"01/01/2013 00:01:00"},
        {"id":"3", "status":"404", "message":"NOT FOUND!", "url":"http://notfound.html", "date":"01/01/2013 00:00:10"},
        {"id":"4", "status":"500", "message":"PROBLEM SIR?", "url":"http://troll.html", "date":"01/01/2013 00:03:10"},
        {"id":"5", "status":"200", "message":"OK", "url":"http://ok.html", "date":"01/01/2013 00:05:10"},
        {"id":"6", "status":"500", "message":"PROBLEM SIR?", "url":"http://troll.html", "date":"01/01/2013 01:04:00"},
        {"id":"7", "status":"404", "message":"NOT FOUND!", "url":"http://notfound.html", "date":"01/01/2013 01:05:00"}
    ]

}

function LogDetailCtrl($scope) {

}
