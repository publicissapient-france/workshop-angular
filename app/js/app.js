'use strict';

/* App Module */

var app = angular.module("workshop", []).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/logs', {templateUrl: 'views/log-list.html', controller: LogCtrl}).
            when('/logs/:logId', {templateUrl: 'views/log-detail.html', controller: LogDetailCtrl}).
            otherwise({redirectTo: '/logs'});
    }]);


/* Controllers */

function LogCtrl($scope, $http) {

    $http.get('/logs').success(function (data) {
        $scope.logs = data;
    });

    $scope.selectedStatus = {
        "200": true,
        "404": true,
        "500": true
    };

    $scope.selectedMethods = {
        "GET": true,
        "POST": true,
        "PUT": true,
        "DELETE": true
    };

    $scope.statusFilter = function (log) {
        return $scope.selectedStatus[log.status];
    };

    $scope.methodsFilter = function (log) {
        return $scope.selectedMethods[log.method];
    };

}

function LogDetailCtrl($scope, $routeParams, $http) {
    $http.get('logs/' + $routeParams.logId).success(function (data) {
        $scope.log = data;
    });
}

/* Filters */

app.filter('truncate', function () {
    return function (text) {
        var length = 15,
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length - end.length) + end;
        }
    };
});
