'use strict';
angular.module('tuto', []);

angular.module('tuto').controller('tutoCtrl', function ($scope, exercise, exerciseLauncher, localStorage) {
    $scope.steps = exercise.STEPS;

    var lastRuningTestIdx = localStorage.lastRuningTestIdx ? parseInt(localStorage.lastRuningTestIdx) : 0;
    exerciseLauncher.execTestsSteps(exercise.STEPS, lastRuningTestIdx);
});

angular.module('tuto').value('localStorage', window.localStorage);

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
		    title: "Le two-way data binding made in AngularJS",
            detailTemplateName: "tuto/views/tutorial-step-two-way-binding.html",
            solutionTemplateName: "tuto/views/tutorial-solution-two-way-binding.html",
            test: function () {
				ok($('#angular-app input[ng-model="query"]').length, "L'attribut ng-model avec la valeur query doit être défini au niveau du champ de recherche");

                $("input").val('test');
				$("input").trigger('input');
                var length = $('#angular-app:contains("test")').length;
				$("input").val('');
				$("input").trigger('input');

                ok(length != 0, "La valeur du champ de recherche doit être affichée dans la page")
            }
        }),
        new Step({
            title: "Création d'un contrôleur",
            detailTemplateName: "tuto/views/tutorial-step-creation-controleur.html",
            solutionTemplateName: "tuto/views/tutorial-solution-creation-controleur.html",
            test: function () {

                try {
                    LogCtrl;
                } catch(error) {
                    fail("Le contrôleur 'LogCtrl' n'est pas defini");
                }

                ok (typeof LogCtrl == 'function', "Le contrôleur 'LogCtrl' doit être une fonction");
                ok(/.*\(.*\$scope.*\).*/.test(LogCtrl.toString()), "Le '$scope' doit être injecté dans le controleur");

                var scope = {};
                LogCtrl(scope)

                ok(scope.logs !== undefined, "La proprieté 'logs' n'est pas defini dans le scope");
                ok(typeof scope.logs == 'object' && scope.logs instanceof Array, "La proprieté 'logs' doit être un tableau")
                ok(scope.logs.length === 7 && scope.logs[0].url === "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                    "Copier les logs depuis les explications")

                ok($('#angular-app[ng-controller*="LogCtrl"]').length, "Le contrôleur 'LogCtrl' doit être défini au niveau du div #angular-app");
                ok($('#angular-app:contains("http://my/site/name/for/fun/and/filtering/demonstration/ok.html")').length,
                    "Le JSON de logs doit être affiché dans la page")

                console.log("Test: " + typeof(scope.logs))
            }
        }),
        new Step({
			title: "Mise en forme des logs",
			detailTemplateName: "tuto/views/tutorial-step-mise-en-forme-log.html",
			solutionTemplateName: "tuto/views/tutorial-solution-mise-en-forme-log.html",
			test: function () {
				var scope = {};
                LogCtrl(scope);
                
				ok(scope.logs != undefined, "La proprieté 'logs' n'est pas defini dans le scope");
                ok(typeof scope.logs == 'object' && scope.logs instanceof Array, "La proprieté 'logs' doit être un tableau");
                ok(scope.logs.length === 7 && scope.logs[0].url === "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                    "Copier les logs depuis les explications");
                
				ok($("#angular-app:contains('[{')").length == 0, "Le JSON brut ne doit plus être affiché");
				ok(/<!-- ngRepeat:\s*.*\s+in\s+logs\s*-->/.test($("#angular-app").html()), "Vous devez utiliser la directive ng-repeat pour afficher les logs");
				ok($("#angular-app tbody tr").size() === 7, "Affichez les logs dans un tableau");
                ok($("#angular-app tbody tr:first td").size() === 5, "Le tableau doit contenir les colonnes date, url, method, status, message");
			}
		}),
        new Step({
            title: "Filtrer les logs",
            detailTemplateName: "tuto/views/tutorial-step-filtrer-log.html",
            solutionTemplateName: "tuto/views/tutorial-solution-filtrer-log.html",
            test: function () {
                ok($('#angular-app input[ng-model="query"]').length, "L'attribut ng-model avec la valeur query doit être défini au niveau du champ de recherche");

                $("input").val('zhkc8fjk');
                $("input").trigger('input');
                var length = $('#angular-app:contains("zhkc8fjk")').length;
                $("input").val('');
                $("input").trigger('input');

                ok(length == 0, "La valeur du champ de recherche ne doit plus être affichée dans la page");
                var totalLogs = $("#angular-app tbody tr").size();
                ok(totalLogs === 7, "Affichez les logs dans un tableau");
                ok(/<!-- ngRepeat:\s*.*\s+in\s+logs\s*\|\s*filter\s*:\s*query\s*-->/.test($("#angular-app").html()), "Vous devez utiliser un filtre dans la directive ng-repeat pour afficher les logs filtrés");

                $("input").val('200');
                $("input").trigger('input');
                var currentTotalLogs = $("#angular-app tbody tr").size();
                $("input").val('');
                $("input").trigger('input');

                ok(totalLogs > currentTotalLogs && currentTotalLogs > 0, "Les logs doivent être filtrés avec la valeur du champ de recherche");
            }
        }),
        new Step({
            title: "Filtrer par statut et méthode",
            detailTemplateName: "tuto/views/tutorial-step-filter-by-status-and-methods.html",
            solutionTemplateName: "tuto/views/tutorial-solution-filter-by-status-and-methods.html",
            test: function () {
                var tuto = {
                    status: {},
                    methods: {}
                };
                var scope = {
                    "$watchCollection": function (watchExpression, listener) {
                        if (watchExpression === 'selectedStatus') {
                            tuto.status.watchExpression = watchExpression;
                        } else if (watchExpression === 'selectedMethods') {
                            tuto.methods.watchExpression = watchExpression;
                        }
                    }
                };
                LogCtrl(scope);

                // status
                ok($(":checkbox").length >= 3, "Insérez les cases à cocher permettant de sélectionner les statuts");
                ok(scope.selectedStatus !== undefined && scope.selectedStatus !== null && typeof scope.selectedStatus === 'object', "Le scope doit contenir un objet 'selectedStatus'");
                ok(scope.selectedStatus["200"] === true && scope.selectedStatus["404"] === true && scope.selectedStatus["500"] === true,
                    "selectedStatus doit contenir l'état de sélection de chaque statut, par défaut, toutes les cases à cocher doivent être sélectionnées");
                ok($(':checkbox[ng-model*="selectedStatus"]').length === 3, "Reliez selectedStatus aux cases à cocher via la directive 'ng-model'");
                ok(tuto.status.watchExpression !== undefined, "Utilisez la méthode $watchCollection du scope pour filtrer les logs à la sélection/déselection d'un statut");

                var initialTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedStatus[\'200\']"]').trigger("click");
                var secondTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedStatus[\'200\']"]').trigger("click");

                ok(initialTotal !== secondTotal, "Les logs doivent être filtrés en fonction des statuts");

                // methods
                ok($(":checkbox").length === 7, "Insérez les cases à cocher permettant de sélectionner les méthodes");
                ok(scope.selectedMethods !== undefined && scope.selectedMethods !== null && typeof scope.selectedMethods === 'object', "Le scope doit contenir un objet 'selectedMethods'");
                ok(scope.selectedMethods["GET"] === true && scope.selectedMethods["POST"] === true && scope.selectedMethods["PUT"] === true && scope.selectedMethods["DELETE"] === true,
                    "selectedMethods doit contenir l'état de sélection de chaque méthode, par défaut, toutes les cases à cocher doivent être sélectionnées");
                ok($(':checkbox[ng-model*="selectedMethods"]').length === 4, "Reliez selectedMethods aux cases à cocher via la directive 'ng-model'");
                ok(tuto.methods.watchExpression !== undefined, "Utilisez la méthode $watchCollection     du scope pour filtrer les logs à la sélection/déselection d'une méthode");

                var initialTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedMethods[\'GET\']"]').trigger("click");
                var secondTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedMethods[\'GET\']"]').trigger("click");

                ok(initialTotal !== secondTotal, "Les logs doivent être filtrés en fonction des méthodes");
            }
        }),
        new Step({
            title: "Tronquer les URL à 15 caractères",
            detailTemplateName: "tuto/views/tutorial-step-truncate-long-url.html",
            solutionTemplateName: "tuto/views/tutorial-solution-truncate-long-url.html",
            test: function () {
                var $filter;
                try {
                    var elem = angular.element(document.querySelector('#angular-app'));
                    var injector = elem.injector();
                    $filter = injector.get('$filter');
                    $filter('truncate');
                } catch (e) {
                    fail("Créez un filtre angular appelé 'truncate'");
                }

                var resultWithShortURL, resultWithLongURL;
                try {
                    resultWithShortURL = $filter('truncate')('shorturl');
                    resultWithLongURL = $filter('truncate')('unelongueurljustepourtester');
                } catch (e) {
                    fail("Créez un filtre qui prend en parametre une string et qui retourne cette string tronquée à 15 caractères, suivie de '...'");
                }

                ok(resultWithShortURL === 'shorturl', "Si on passe 'shorturl' en paramètre du filtre, il doit retourner 'shorturl'");
                ok(resultWithLongURL === 'unelongueurl...', "Si on passe 'unelongueurljustepourtester' en paramètre du filtre, il doit retourner 'unelongueurl...'");

                ok($("#content td:contains('...')").length > 1, "Appliquez votre filtre dans le template pour tronquer l'URL des logs");
            }
        }),
        new Step({
            title: "Requêter le backend",
            detailTemplateName: "tuto/views/tutorial-step-requete-backend.html",
            solutionTemplateName: "tuto/views/tutorial-solution-requete-backend.html",
            test: function () {
                var tuto = {};

                var promise = {
                    success: function (callback) {
                        callback([
                            {
                                "id": "PLOP",
                                "method": "GET",
                                "status": "200",
                                "message": "OK",
                                "url": "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                                "date": "01/01/2013 00:00:00"
                            }
                        ]);
                    },
                    error: function () {

                    }
                };

                var scope = {
                    "$watchCollection": function (){},
                    selectedStatus: { "200": true},
                    selectedMethods: { "GET": true}
                };

                var httpService = {
                    get: function (url) {
                        tuto.url = url;
                        return promise;
                    }
                };

                LogCtrl(scope, httpService);
                ok(/.*\(.*\$http.*\).*/.test(LogCtrl.toString()), "Le service '$http' doit être injecté dans le controleur");

                ok(tuto.url === '/logs', "Requetez le endpoint '/logs'")
                ok(scope.logs[0].id === 'PLOP', "Le service $http retourne une promesse, dans la méthode success, mettez à jour la propriété $scope.logs avec les données retournées par le backend. Pensez à supprimer les logs statiques");
                ok(scope.selectedLogs !== undefined && scope.selectedLogs.length === 1, "Dans la fonction success, appelez la méthode qui permet de filtrer les logs, afin de les afficher");
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

angular.module('tuto').service('exerciseLauncher', function (localStorage) {
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
            localStorage.lastRuningTestIdx = index;
            failed = true;
            if (e instanceof Failed) {
                assertionFailed.push(e.message);
            } else {
                assertionFailed.push("Error: " + e.message);
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
