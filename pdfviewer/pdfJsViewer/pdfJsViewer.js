angular.module('pdfviewerPdfJsViewer', ['servoy']).directive('pdfviewerPdfJsViewer', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel',
            api: "=svyApi"
        },
        link: function ($scope, $element, $attrs) {
            $scope.iframeURL = '';
            $scope.documentURL = '';
            $scope.pageNumber = '';
            $scope.zoomLevel = '';
            $scope.noCache = '';
        },
        controller: function ($scope, $element, $attrs, $timeout, $sce) {
            // reload doc
            $scope.api.reload = function () {
                // load doc
                createBaseURL();
                setPageNumer();
                zoomLevel();
                noCache();
            };

            // load doc
            function createBaseURL() {
                $scope.documentURL = "pdfviewer/pdfJsViewer/web/viewer.html";
                if ($scope.model.dataProviderID && $scope.model.dataProviderID.url) {
                	var serverUrl = window.location.href.split('/solutions/')[0];
                    $scope.documentURL += "?file=" + (serverUrl + '/' + $scope.model.dataProviderID.url);
                } else if ($scope.model.documentURL) {
                    // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
                    $scope.documentURL += "?file=" + ($scope.model.documentURL);
                } else {
                    return false;
                }    
            };

            function noCache() {
                // check for noCache and generate random http param
                if ($scope.model.noCache === true) {
                    var r = Math.round(Math.random() * 10000000);
                    $scope.noCache = 'r=' + r;
                } else {
                    $scope.noCache = '';
                }
            }
            function zoomLevel() {
                if ($scope.model.zoomLevel != null) {
                    $scope.zoomLevel = 'zoom=' + $scope.model.zoomLevel;
                } else {
                    $scope.zoomLevel = '';
                }
            }
            function setPageNumer() {
                if ($scope.model.pageNumber != null && $scope.model.pageNumber >= 1) {
                   $scope.pageNumber = 'page=' + $scope.model.pageNumber
                } else {
                    $scope.pageNumber = '';
                }
            }

            function addCustomCSS() {
                // add custom CSS to the iframe
                if ($scope.model.styleSheet) {
                    console.log('bla')
                    // wait for the markup id
                    $timeout(function () {
                        var iframe = $element.find("iframe")[0];
                        $(iframe).on('load', function (event) {
                            var link = document.createElement("link");
                            link.href = window.location.origin + '/' + $scope.model.styleSheet;
                            link.rel = "stylesheet";
                            link.type = "text/css";
                            frames[0].document.head.appendChild(link);
                        });
                    })
                }
            }

            $scope.$watch('[documentURL, pageNumber, zoomLevel, noCache]', function(newValues, oldValues, scope) {
                if(!newValues[0]) {
                    return
                }

                var url = newValues.shift();
                newValues = newValues.filter(function(item) {
                    return (item != null && item != '');
                });
                $scope.iframeURL = $sce.trustAsResourceUrl(url + '#' + newValues.join('&'));
                console.debug('Rendering iframe pdf with URL: ' + $scope.iframeURL);
            })

            $scope.$watch('model.noCache', function (newValue, oldValue) {
                noCache();
            });

            $scope.$watch('model.zoomLevel', function (newValue, oldValue) {
                zoomLevel();
            });

            $scope.$watch('model.pageNumber', function (newValue, oldValue) {
                setPageNumer();
            });
            // watch doc url
            $scope.$watch('model.documentURL', function (newValue, oldValue) {
                createBaseURL();
            });

            $scope.$watch('model.dataProviderID', function (newValue, oldValue) {
                createBaseURL();
            });

            $scope.$watch('model.visible', function (newValue, oldValue) {
                addCustomCSS();
            });
        },
        templateUrl: 'pdfviewer/pdfJsViewer/pdfJsViewer.html'
    };
})