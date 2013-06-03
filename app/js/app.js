var app = angular.module("workshop", []);

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

    $scope.$watchCollection('selectedStatus', filterLogs, true);
    $scope.$watchCollection('selectedMethods', filterLogs, true);
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
