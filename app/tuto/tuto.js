'use strict';
angular.module('tuto', []);

angular.module('tuto').controller('tutoCtrl', function ($scope, exercise, exerciseLauncher, localStorage) {
    $scope.steps = exercise.STEPS;

    var lastRunningTestIdx = localStorage.lastRunningTestIdx ? parseInt(localStorage.lastRunningTestIdx) : 0;
    exerciseLauncher.execTestsSteps(exercise.STEPS, lastRunningTestIdx);
});

angular.module('tuto').value('localStorage', window.localStorage);

angular.module('tuto').directive('scrollTo', function () {
    return function (scope, element, attributes) {
        var tutoOffset = localStorage.tutoOffset ? parseInt(localStorage.tutoOffset) : 0;
        setTimeout(function () {
            $('#tutorial').scrollTop(tutoOffset);
        }, 20);
    }
});

angular.module('tuto').directive('scrollSave', function (localStorage) {
    return function (scope, element, attributes) {
        $('#tutorial').scroll(function(e) {
            localStorage.tutoOffset = $('#tutorial').scrollTop();
        });
    }
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

    function checkUrl(url, success, fail) {
        $.ajax({
            url: url,
            async: false
        }).done(function (data) {
                success(data);
        }).fail(function () {
                fail();
        });
    }

    var injector = {
        get: function (service) {
            var elem = angular.element(document.querySelector('#angular-app'));
            var injector = elem.injector();
            if (injector) {
                return injector.get(service);
            }
            fail("Erreur lors de l'initialisation du module workshop");
        }
    };

    function withRoot(data) {
        return $("<div>" + data + "</div>");
    }

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
                ok($('#angular-app[ng-app]').length, "L'attribut ng-app doit être défini au niveau du div #angular-app");
                ok($('#angular-app[ng-app*="workshop"]').length, "La valeur de l'attribut ng-app doit être le nom du module qui gère la page");
            }
        }),
		new Step({
		    title: "Le two-way data binding",
            detailTemplateName: "tuto/views/tutorial-step-two-way-binding.html",
            solutionTemplateName: "tuto/views/tutorial-solution-two-way-binding.html",
            test: function () {
                ok($('#angular-app input[ng-model="query"]').length, "Ajouter au champ de recherche l'attribut ng-model avec la valeur query");

                $("input").val('test');
				$("input").trigger('input');
                var length = $('#angular-app:contains("test")').length;
				$("input").val('');
				$("input").trigger('input');

                ok(length != 0, "La valeur entrée dans le champ de recherche doit être affichée dans la page")
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
                    fail("Le contrôleur 'LogCtrl' n'est pas défini");
                }

                ok (typeof LogCtrl == 'function', "Le contrôleur 'LogCtrl' doit être une fonction");
                ok(/.*\(.*\$scope.*\).*/.test(LogCtrl.toString()), "Le '$scope' doit être injecté dans le contrôleur");

                var scope = {};
                LogCtrl(scope)

                ok(scope.logs !== undefined, "La proprieté 'logs' n'est pas définie dans le scope");
                ok(typeof scope.logs == 'object' && scope.logs instanceof Array, "La proprieté 'logs' doit être un tableau");
                ok(scope.logs.length === 7 && scope.logs[0].url === "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                    "Copier les logs depuis le fichier workshop-angular/data/log-list.json et les assigner en dur dans la propriété $scope.logs");

                ok($('#angular-app[ng-controller*="LogCtrl"]').length, "Le contrôleur 'LogCtrl' doit être défini au niveau du div #angular-app à l'aide de l'attribut ng-controller");
                ok($('#angular-app:contains("http://my/site/name/for/fun/and/filtering/demonstration/ok.html")').length,
                    "Les logs doivent être affichés dans la page")
            }
        }),
        new Step({
			title: "Mise en forme des logs",
			detailTemplateName: "tuto/views/tutorial-step-mise-en-forme-log.html",
			solutionTemplateName: "tuto/views/tutorial-solution-mise-en-forme-log.html",
			test: function () {
				var scope = {};
                LogCtrl(scope);
                
				ok(scope.logs != undefined, "La proprieté 'logs' n'est pas définie dans le scope");
                ok(typeof scope.logs == 'object' && scope.logs instanceof Array, "La proprieté 'logs' doit être un tableau");
                ok(scope.logs.length === 7 && scope.logs[0].url === "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                    "Copier les logs depuis le fichier workshop-angular/data/log-list.json");

				ok(/<!-- ngRepeat:\s*.*\s+in\s+logs\s*-->/.test($("#angular-app").html()), "Utiliser la directive ng-repeat pour parcourir les logs et les afficher dans le tableau");
				ok($("#angular-app tbody tr").size() === 7, "Afficher les logs dans le tableau");
                var firstLog = $("#angular-app tbody tr:first");
                multiple([
                    firstLog.find("td:nth(0)").text().length > 1,
                    firstLog.find("td:nth(1)").text().length > 1,
                    firstLog.find("td:nth(2)").text().length > 1,
                    firstLog.find("td:nth(3)").text().length > 1,
                    firstLog.find("td:nth(4)").text().length > 1
                ], "Le tableau doit afficher la date, l'url, le verbe, le statut et le message de chaque log");
                ok($("#angular-app:contains('[{')").length == 0, "Le JSON brut ne doit plus être affiché");
			}
		}),
        new Step({
            title: "Tronquer les URL",
            detailTemplateName: "tuto/views/tutorial-step-truncate-long-url.html",
            solutionTemplateName: "tuto/views/tutorial-solution-truncate-long-url.html",
            test: function () {
                var $filter = injector.get('$filter');
                try {
                    $filter('truncate');
                } catch (e) {
                    fail("Créer un filtre angular appelé 'truncate'");
                }

                var resultWithShortURL, resultWithLongURL;
                try {
                    resultWithShortURL = $filter('truncate')('shorturl');
                    resultWithLongURL = $filter('truncate')('unelongueurljustepourtester');
                } catch (e) {
                    fail("Créer un filtre qui prend en paramètre une string et qui retourne cette string tronquée à 12 caractères, suivie de '...'");
                }

                ok(resultWithShortURL === 'shorturl', "Si on passe 'shorturl' en paramètre du filtre, il doit retourner 'shorturl'");
                ok(resultWithLongURL === 'unelongueurl...', "Si on passe 'unelongueurljustepourtester' en paramètre du filtre, il doit retourner 'unelongueurl...'");

                ok($("#content td:contains('...')").length > 1, "Appliquer le filtre dans le template html pour tronquer l'URL des logs");
            }
        }),
        new Step({
            title: "Filtrer les logs par mots clés",
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
                ok(totalLogs === 7, "Les logs doivent être affichés dans un tableau");
                ok(/<!-- ngRepeat:\s*.*\s+in\s+logs\s*\|\s*filter\s*:\s*query\s*-->/.test($("#angular-app").html()), "Utiliser un filtre dans la directive ng-repeat pour afficher les logs filtrées");

                $("input").val('200');
                $("input").trigger('input');
                var currentTotalLogs = $("#angular-app tbody tr").size();
                $("input").val('');
                $("input").trigger('input');

                ok(totalLogs > currentTotalLogs && currentTotalLogs > 0, "Les logs doivent être filtrées avec la valeur du champ de recherche");
            }
        }),
        new Step({
            title: "Filtrer les logs par statuts et verbes HTTP",
            detailTemplateName: "tuto/views/tutorial-step-filter-by-status-and-methods.html",
            solutionTemplateName: "tuto/views/tutorial-solution-filter-by-status-and-methods.html",
            test: function () {
                var tuto = {
                    status: {},
                    methods: {}
                };
                var scope = {
                    "$watchCollection": function (watchExpression) {
                        if (watchExpression === 'selectedStatus') {
                            tuto.status.watchExpression = watchExpression;
                        } else if (watchExpression === 'selectedMethods') {
                            tuto.methods.watchExpression = watchExpression;
                        }
                    }
                };
                LogCtrl(scope);

                // status
                ok($(":checkbox").length >= 3, "Insérer les cases à cocher permettant de sélectionner les statuts");
                ok(scope.selectedStatus !== undefined && scope.selectedStatus !== null && typeof scope.selectedStatus === 'object', "Le scope doit contenir un objet 'selectedStatus'");
                ok(scope.selectedStatus["200"] === true && scope.selectedStatus["404"] === true && scope.selectedStatus["500"] === true,
                    "selectedStatus doit contenir l'état de sélection de chaque statut, par défaut, toutes les cases à cocher doivent être sélectionnées");
                ok($(':checkbox[ng-model*="selectedStatus"]').length === 3, "Relier selectedStatus aux cases à cocher via la directive 'ng-model'");
                ok(tuto.status.watchExpression !== undefined, "Utiliser la méthode $watchCollection du scope pour filtrer les logs à la sélection/déselection d'un statut");

                var initialTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedStatus[\'200\']"]').trigger("click");
                $(':checkbox[ng-model="selectedStatus[200]"]').trigger("click");
                $(':checkbox[ng-model="selectedStatus.200]"]').trigger("click");
                var secondTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedStatus[\'200\']"]').trigger("click");
                $(':checkbox[ng-model="selectedStatus[200]"]').trigger("click");
                $(':checkbox[ng-model="selectedStatus.200]"]').trigger("click");

                ok(initialTotal !== secondTotal, "Les logs doivent être filtrées en fonction des statuts, la directive ng-repeat doit itérer sur les logs filtrées");

                // methods
                ok($(":checkbox").length === 7, "Insérer les cases à cocher permettant de sélectionner les verbes");
                ok(scope.selectedMethods !== undefined && scope.selectedMethods !== null && typeof scope.selectedMethods === 'object', "Le scope doit contenir un objet 'selectedMethods'");
                ok(scope.selectedMethods["GET"] === true && scope.selectedMethods["POST"] === true && scope.selectedMethods["PUT"] === true && scope.selectedMethods["DELETE"] === true,
                    "selectedMethods doit contenir l'état de sélection de chaque verbe, par défaut, toutes les cases à cocher doivent être sélectionnées");
                ok($(':checkbox[ng-model*="selectedMethods"]').length === 4, "Relier selectedMethods aux cases à cocher via la directive 'ng-model'");
                ok(tuto.methods.watchExpression !== undefined, "Utiliser la méthode $watchCollection     du scope pour filtrer les logs à la sélection/déselection d'un verbe");

                var initialTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedMethods[\'GET\']"]').trigger("click");
                $(':checkbox[ng-model="selectedMethods.GET]"]').trigger("click");
                var secondTotal = $("#angular-app tbody tr").size();
                $(':checkbox[ng-model="selectedMethods[\'GET\']"]').trigger("click");
                $(':checkbox[ng-model="selectedMethods.GET]"]').trigger("click");
                
                ok(initialTotal !== secondTotal, "Les logs doivent être filtrées en fonction des verbes, la directive ng-repeat doit itérer sur les logs filtrées");
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
                        return this;
                    },
                    error: function () {
                        return this;
                    }
                };

                var scope = {
                    "$watchCollection": function (){},
                    selectedStatus: { "200": true},
                    selectedMethods: { "GET": true}
                };

                var httpService = function(config) {
                    if (config && config.method === 'GET') {
                        tuto.url = config.url;
                    }
                    return promise;
                };
                httpService['get'] = function (url) {
                    tuto.url = url;
                    return promise;
                };

                LogCtrl(scope, httpService);
                ok(/.*\(.*\$http.*\).*/.test(LogCtrl.toString()), "Le service '$http' doit être injecté dans le contrôleur");

                ok(tuto.url === '/logs', "Requêter le endpoint '/logs'");
                ok(scope.logs[0].id === 'PLOP', "Le service $http retourne une promesse : dans la fonction success, mettre à jour la propriété $scope.logs avec les données retournées par le backend. Penser à supprimer les logs statiques de l'étape précédente.");
                ok(scope.selectedLogs !== undefined && scope.selectedLogs.length === 1, "Dans la fonction success, appeler la fonction qui permet de filtrer les logs, afin de les afficher");
            }
        }),
        new Step({
            title: "Utiliser le routeur",
            detailTemplateName: "tuto/views/tutorial-step-routeur.html",
            solutionTemplateName: "tuto/views/tutorial-solution-routeur.html",
            test: function () {
                var routerProvider = injector.get('$route');
                ok(routerProvider.routes['/'] !== undefined, "Configurer le $routeProvider pour définir la route '/'");
                ok(routerProvider.routes['/'].controller === LogCtrl || routerProvider.routes['/'].controller === 'LogCtrl', "La route '/' doit être gérée par LogCtrl");
                checkUrl('/views/log-list.html', function(data) {
                    ok(/ng-repeat/.test(data), "Déplacer le contenu du div angular-app dans le template views/log-list.html");
                }, function() {
                    fail("Créer un template 'log-list.html' dans le répertoire app/views");
                });
                ok(routerProvider.routes['/'].templateUrl === 'views/log-list.html', "La route '/' doit afficher le template views/log-list.html");
                ok($("#angular-app[ng-controller]").length === 0, "Supprimer la directive ng-controller du div angular-app");
                ok($("#angular-app[ng-view]").length !== 0, "Utiliser la directive ng-view sur le div angular-app pour afficher le template correspondant à la route active. Le div #angular-app doit maintenant être vide.");
            }
        }),
        new Step({
            title: "Afficher le détail d'un log",
            detailTemplateName: "tuto/views/tutorial-step-log-details.html",
            solutionTemplateName: "tuto/views/tutorial-solution-log-details.html",
            test: function () {
                checkUrl('/views/log-list.html', function(data) {
                    ok(withRoot(data).find("#content td:first a[href^='#/logs/{{log.id}}']").length > 0, "Ajouter un lien vers le détail d'une log sur la date de chaque log");
                }, function() {
                    fail("Créer un template 'log-list.html' dans le répertoire app/views");
                });

                var routerProvider = injector.get('$route');
                ok(routerProvider.routes['/logs/:logId'] !== undefined, "Configurer le $routeProvider pour définir la route '/logs/:logId'");

                var templateContent = '';

                checkUrl('/views/log-details.html', function(data) {
                    templateContent = withRoot(data);
                }, function() {
                    fail("Créer un template 'log-details.html' dans le répertoire app/views");
                });

                ok(routerProvider.routes['/logs/:logId'].templateUrl === 'views/log-details.html', "La route '/logs/:logId' doit afficher le template views/log-details.html");

                try {
                    LogDetailCtrl;
                } catch(error) {
                    fail("Le contrôleur 'LogDetailCtrl' n'est pas défini");
                }

                ok (typeof LogDetailCtrl == 'function', "Le contrôleur 'LogDetailCtrl' doit être une fonction");
                ok(routerProvider.routes['/logs/:logId'].controller === LogDetailCtrl, "La route '/logs/:logId' doit être gérée par LogDetailCtrl");
                multiple([
                    /.*\(.*\$scope.*\).*/.test(LogDetailCtrl.toString()),
                    /.*\(.*\$routeParams.*\).*/.test(LogDetailCtrl.toString()),
                    /.*\(.*\$http.*\).*/.test(LogDetailCtrl.toString())
                ], "Injecter dans le contrôleur les services '$scope', '$routeParams' et '$http'");

                var scope = {
                };

                var promise = {
                    success: function (callback) {
                        callback(
                            {
                                "id": "PLOP",
                                "method": "GET",
                                "status": "200",
                                "message": "OK",
                                "url": "http://my/site/name/for/fun/and/filtering/demonstration/ok.html",
                                "date": "01/01/2013 00:00:00"
                            }
                        );
                        return this;
                    },
                    error: function () {
                        return this;
                    }
                };

                var tuto = {};
                var httpService = function(config) {
                    if (config && config.method === 'GET') {
                        tuto.url = config.url;
                    }
                    return promise;
                };
                httpService['get'] = function (url) {
                    tuto.url = url;
                    return promise;
                };

                LogDetailCtrl(scope, {logId: 1}, httpService);
                ok(tuto.url === '/logs/1', "Le service $http doit récupérer la log via un get sur l'url '/logs/$routeParams.logId'");
                ok(scope.log, "La log retournée par le backend doit être stockée dans la propriété $scope.log");
                multiple([
                    /\{\{\s*log\.date\s*\}\}/.test(templateContent.html()),
                    /\{\{\s*log\.url\s*\}\}/.test(templateContent.html()),
                    /\{\{\s*log\.method\s*\}\}/.test(templateContent.html()),
                    /\{\{\s*log\.status\s*\}\}/.test(templateContent.html()),
                    /\{\{\s*log\.message\s*\}\}/.test(templateContent.html())
                ], "Afficher dans le nouveau template la date, l'url, le verbe, le statut et le message de la log");
            }
        }),
        new Step({
            title: "Bonus : Créer une directive",
            detailTemplateName: "tuto/views/tutorial-step-directive.html",
            solutionTemplateName: "tuto/views/tutorial-solution-directive.html",
            test: function () {
                checkUrl('/views/log-list.html', function(data) {
                    var templateContent = withRoot(data);
                    ok(templateContent.find("*[toggle-visibility]").length > 0, "Ajouter une balise avec l'attribut 'toggle-visibility' dans le div #content du template views/log-list.html");
                    ok(templateContent.find("*[toggle-visibility*='selectedLogs.length']").length > 0, "L'attribut 'toggle-visibility' doit prendre pour valeur un test sur la taille des logs sélectionnées");
                    ok(templateContent.find("*[toggle-visibility*='selectedLogs.length']").text().length > 0, "Ajouter un message d'avertissement au sein de cette balise");
                });

                var $compile = injector.get('$compile');
                var $rootScope = injector.get('$rootScope');

                $rootScope.flagFalse = false;
                var compiledFalse = $compile('<div ng-app="workshop"><div id="toto" toggle-visibility="flagFalse">plop</div></div>')($rootScope);
                $rootScope.$digest();

                $rootScope.flagTrue = true;
                var compiledTrue = $compile('<div ng-app="workshop"><div id="toto" toggle-visibility="flagTrue">plop</div></div>')($rootScope);
                $rootScope.$digest();

                ok($(compiledFalse.html()).css('display') === 'none' && $(compiledTrue.html()).css('display') !== 'none', "Créer la directive toggleVisibility permettant d'afficher ou cacher un élément en fonction du booléen passé en paramètre");
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

    function multiple(testArray, msg) {
        var successfulTest = 0;
        for (var i = 0 ; i < testArray.length ; i++) {
            if (!!testArray[i]) {
                successfulTest++;
            }
        }
        if (successfulTest < testArray.length) {
            throw new Failed(msg + " (" + successfulTest + "/" + testArray.length + ")")
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
            localStorage.lastRunningTestIdx = index;
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
