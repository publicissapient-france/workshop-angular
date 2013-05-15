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
