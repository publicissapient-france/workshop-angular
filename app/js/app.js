var app = angular.module('workshop', []);

app.filter('truncate', function () {
    return function (text) {
        return text.length > 12 ? text.substring(0, 12) + '...' : text;
    };
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'views/log-list.html', controller: LogCtrl}).
        when('/logs/:logId', {templateUrl: 'views/log-details.html', controller: LogDetailCtrl })
}]);

app.directive('toggleVisibility', function () {
    return function (scope, element, attr) {
        scope.$watch(attr.toggleVisibility, function (value) {
            value ? element.show() : element.hide()
        });
    }
});

function LogDetailCtrl($scope, $routeParams, $http) {
    $http.get('/logs/' + $routeParams.logId).success(function (data) {
        $scope.log = data;
    });
}

function LogCtrl($scope, $http) {
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
            $scope.logs.forEach(function (log) {
                if ($scope.selectedStatus[log.status] && $scope.selectedMethods[log.method]) {
                    result.push(log);
                }
            });
            $scope.selectedLogs = result;
        }
    }

    $scope.$watchCollection('selectedStatus', filterLogs);
    $scope.$watchCollection('selectedMethods', filterLogs);

    $http.get('/logs').success(function (data) {
        $scope.logs = data;
        filterLogs();
    });
}
