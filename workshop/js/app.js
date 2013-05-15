/* App Module */

angular.module("workshop",["filters"]).
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

function LogCtrl($scope, $http) {


    $http.get('workshop/data/logs.json').success(function(data, status, headers, config) {
        $scope.logs = data;
    });

    $scope.selectedStatus={
        "200":true,
        "404":true,
        "500":true
    }



    $scope.statusFilter = function(log) {

        if ($scope.selectedStatus[log.status]) {
            return true;
        }

        return false;
    };


}

function LogDetailCtrl($scope) {

}


angular.module('filters', []).
    filter('truncate', function () {
        return function (text) {
            var length = 15;
            var end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });