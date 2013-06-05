var app = angular.module("workshop", []).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: 'views/log-list.html', controller: LogCtrl}).
            when('/logs/:logId', {templateUrl: 'views/log-details.html', controller: LogDetailCtrl })
    }]);

function LogDetailCtrl($scope, $routeParams, $http) {
    $http.get('/logs/' + $routeParams.logId).success(function (data) {
        $scope.log = data;
    });
}

function LogCtrl($scope, $http) {

    $http.get('/logs').success(function (data) {
        $scope.logs = data;
        filterLogs();
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

    function filterLogs() {
        if ($scope.logs) {
            var result = [];
            $scope.logs.forEach(function(log) {
                if ($scope.selectedStatus[log.status]
                    && $scope.selectedMethods[log.method]) {
                    result.push(log);
                }
            });
            $scope.selectedLogs = result;
        }
    }

    $scope.$watchCollection('selectedStatus', filterLogs);
    $scope.$watchCollection('selectedMethods', filterLogs);
}

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
