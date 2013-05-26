'use strict';
angular.module('tuto', []);

angular.module('tuto').controller('tutoCtrl', function ($scope, exercise, exerciseLauncher) {
    $scope.steps = exercise.STEPS;

    exerciseLauncher.execTestsSteps(exercise.STEPS, exercise.STEPS.length);
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
    Step.prototype.passed = true;
    Step.prototype.executed = false;
    Step.prototype.errors = [];
    Step.prototype.active = false;

    var STEPS = [
        new Step({
            title: "Initialisation de l'application",
            detailTemplateName: "tuto/views/tutorial-step-initialisation.html",
            solutionTemplateName: "tuto/views/tutorial-solution-initialisation.html",
            test: function () {
                // Verify module
                try {
                    angular.module('workshop');
                } catch (e) {
                    fail("Le module 'workshop' n'est pas défini");
                }

                // verify ng-app
                ok($('#angular-app[ng-app*="workshop"]').length, "L'attribut ng-app doit être défini au niveau du div #angular-app");
            }
        }),
		new Step({
		    title: "Le two-way binding made in angular",
            detailTemplateName: "tuto/views/tutorial-step-two-way-binding.html",
            solutionTemplateName: "tuto/views/tutorial-solution-two-way-binding.html",
            test: function () {
				ok($('#angular-app input[ng-model="query"]').length, "L'attribut ng-model avec la valeur query doit être défini au niveau du champs de recherche");

                $("input").val('test');
				$("input").trigger('input');
				
				ok($('#angular-app:contains("test")').length, "La valeur doit être affichée dans la page")
				$("input").val('')				
				$("input").trigger('input')	
            }
        }),
        new Step({
            title: "Créer un controlleur",
            detailTemplateName: "tuto/views/tutorial-step-ds.html",
            solutionTemplateName: "tuto/views/tutorial-solution-ds.html",
            test: function () {

                try {
                    LogCtrl;
                } catch(error) {
                    fail("Le controleur 'LogCtrl' n'est pas definit");
                }

                ok (typeof LogCtrl == 'function', "Le controleur 'LogCtrl' doit être une fonction");
                ok(/.*\(.*\$scope.*\).*/.test(LogCtrl.toString()), "Le '$scope' doit être injecté dans le controleur");

                var scope = {};
                LogCtrl(scope)

                ok(scope.logs != undefined, "Proprieté 'logs' n'est pas defini dans le scope");
                ok(typeof scope.logs == 'object' && scope.logs instanceof Array, "Proprieté 'logs' doit être un tableau")
                ok(scope.logs.length > 0, "Copier les logs depuis les explications")

                console.log("Test: " + typeof(scope.logs))
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
    function execTestsSteps(steps, index, prevStep) {
        var assertionFailed = [];
        if (index === 0) {
            if (prevStep) prevStep.active = true;
            return;
        }
        var step = steps[index - 1];
        var test = step.test;
        var failed = false;

        try {
            test();
            if (prevStep) prevStep.active = true;
            return;
        } catch (e) {
            failed = true;
            if (e instanceof Failed) {
                assertionFailed.push(e.message);
            } else {
                assertionFailed.push("Error :" + e.message);
            }

            execTestsSteps(steps, index - 1, step);
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