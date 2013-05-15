'use strict';
angular.module('tuto', []);

angular.module('tuto').controller('tutoCtrl', function ($scope, exercise, exerciseLauncher) {
    $scope.steps = exercise.STEPS;

    exerciseLauncher.execTestsSteps(exercise.STEPS, 0);
});

angular.module('tuto').service('exercise', function ($controller) {
    var countAssert;

    function Step(obj) {
        for (var prop in obj)
            this[prop] = obj[prop];
    }
    Step.prototype.title = "";
    Step.prototype.detailTemplateName = "tutorial-step-empty";
    Step.prototype.solutionTemplateName = "tutorial-solution-empty";
    Step.prototype.test = function () {
        ok(false, "Test not implemented")
    };
    Step.prototype.passed = false;
    Step.prototype.executed = false;
    Step.prototype.errors = [];
    Step.prototype.isActive = function () {
        return !this.passed && this.executed;
    };

    var STEPS = [
        new Step({
            title: "Création de l'application",
            detailTemplateName: "tuto/views/tutorial-step-creation.html",
            solutionTemplateName: "tuto/views/tutorial-solution-creation.html",
            test: function () {
                // Verify module
                try {
                    angular.module('accessLog');
                } catch (e) {
                    fail("Module 'accessLog' n'est pas défini");
                }

                // Verify controller
                try {
                    var elem = angular.element(document.querySelector('#angular-app'));
                    var injector = elem.injector();
                    var $controller = injector.get('$controller');
                    $controller('testCtrl', {$scope: {}});
                } catch (e) {
                    fail("Controller 'testCtrl' n'est pas défini");
                }

                // verify ng-app
                ok($('div[ng-app*="accessLog"]').length, "ng-app n'est pas défini dans template");

                // verify ng-controller
                ok($('div[ng-controller*="testCtrl"]').length, "ng-controller n'est pas défini dans template");
            }
        }),
        new Step({
            title: "Dites bonjour au monde des poneys",
            detailTemplateName: "tuto/views/tutorial-step-hello.html",
            solutionTemplateName: "tuto/views/tutorial-solution-hello.html",
            test: function () {
//                ok(false, "Second step. Test 1");
            }
        }),
        new Step({
            title: "Créer un datastore",
            detailTemplateName: "tuto/views/tutorial-step-ds.html",
            solutionTemplateName: "tuto/views/tutorial-solution-ds.html",
            test: function () {
                ok(false, "Third step is failed.");
            }
        }),
        new Step({
            title: "Créer une classe Pony",
            detailTemplateName: "tuto/views/tutorial-step-model.html",
            solutionTemplateName: "tuto/views/tutorial-solution-model.html",
            test: function () {
            }
        })
    ];

    function ok(testPassed, msg) {
        countAssert++;
        testPassed = !!testPassed;
        if (!testPassed) {
            throw new Failed(msg)
        }
    }

    function fail(msg) {
        ok(false, msg)
    }

    function equal(a, b, msg) {
        ok(a === b, msg);
    }

    return {
        STEPS: STEPS
    }
});

angular.module('tuto').service('exerciseLauncher', function () {
    function execTestsSteps(steps, index) {
        var assertionFailed = [];
        if (steps.length == index) return;
        var step = steps[index];
        var test = step.test;
        var failed = false;

        try {
            if (index < steps.length) {
                var promiseOfTest = test();
                if (promiseOfTest) {
                    promiseOfTest.done(function () {
                        execTestsSteps(steps, 1 + index);
                    });
                } else {
                    execTestsSteps(steps, 1 + index);
                }
            }
        } catch (e) {
            failed = true;
            if (e instanceof Failed) {
                assertionFailed.push(e.message);
            } else {
                assertionFailed.push("Error :" + e.message);
            }
        } finally {
            step.executed = true;
            step.passed = !failed;
            step.errors = assertionFailed;
        }
    }

    return {
        execTestsSteps: execTestsSteps
    };
});

function Failed(message) {
    this.name = "Failed";
    this.message = message || "Default Message";
}
Failed.prototype = new Error();



angular.module('tuto').directive('highlight', function ($timeout) {
    var template = "<pre class='{{conf}}'>{{markdown}}</pre>";

    return {
        restrict: 'A',
        scope: {},
        compile: function(tElement, tAttrs, transclude) {
            var markdown = tElement.context.innerHTML;

            tElement.html(template);

            return function(scope, element, attrs) {
                scope.markdown = markdown;
                scope.conf = attrs.conf ? attrs.conf : 'brush: js';

                $timeout(function () {
                   SyntaxHighlighter.highlight();
                }, 20, false);
            }
        }
    };
});



angular.bootstrap($('#tutorial'), ['tuto']);