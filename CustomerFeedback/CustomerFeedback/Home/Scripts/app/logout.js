app.appfeedback.controller('logoutController', function ($scope, $timeout, $http) {
    var logger = app.logger;
    $scope.logout = function () {
        $http({
            method: 'POST',
            url: 'api/Logout',
            contentType: 'application/json;charset=utf-8',
            async: false,
        }).
        success(function (data, status, headers, config) {
            logger.error("User Logged out!!!");
            window.location.assign("./Login.html");
        }).
        error(function (data, status, headers, config) {
            logger.error("Validation failed");
        });

    };
});
