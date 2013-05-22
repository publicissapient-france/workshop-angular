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

function LogCtrl($scope, $http, history) {
    var logs = [];
    $scope.history = history;

    $http.get('/logs').success(function (data) {
        $scope.filteredLogs = logs = data;
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

    $scope.$watch('selectedStatus', function () {
        filterLogs();
    }, true);

    $scope.$watch('selectedMethods', function () {
        filterLogs();
    }, true);

    $scope.submit = function() {
        if ($scope.textSearchInput) {
            history.unshift($scope.textSearchInput);
        }
        filterLogs();
    };

    function filterLogs() {
        var result = [];
        logs.forEach(function(log) {
            if ((!$scope.textSearchInput || log.url.indexOf($scope.textSearchInput) != -1)
                && $scope.selectedStatus[log.status]
                && $scope.selectedMethods[log.method] ) {
                result.push(log);
            }
        });

        $scope.filteredLogs = result;
    }

    $scope.searchFromHistory = function(search) {
        $scope.textSearchInput = search;
        filterLogs();
    }
}

function LogDetailCtrl($scope, $routeParams, $http) {
    $http.get('logs/' + $routeParams.logId).success(function (data) {
        $scope.log = data;
    });
}

app.factory('history', function () {
    var history = [];
    return history;
});

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
