angular.module('pdfviewerPdfViewer', ['servoy']).directive('pdfviewerPdfViewer', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel',
            api: "=svyApi"
        },
        link: function ($scope, $element, $attrs) {
            $scope.iframeURL = '';
            $scope.documentURL = '';
            $scope.noCache = '';
        },
        controller: function ($scope, $element, $attrs, $sce) {

            // load doc
            function createBaseURL() {
                $scope.documentURL = "";
                if ($scope.model.dataProviderID && $scope.model.dataProviderID.url) {
                    $scope.documentURL += window.location.origin + '/' + $scope.model.dataProviderID.url;
                } else if ($scope.model.documentURL) {
                    // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
                    $scope.documentURL += $scope.model.documentURL;
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

            $scope.$watch('[documentURL, noCache]', function(newValues, oldValues, scope) {
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

            // watch doc url
            $scope.$watch('model.documentURL', function (newValue, oldValue) {
                createBaseURL();
            });

            $scope.$watch('model.dataProviderID', function (newValue, oldValue) {
                createBaseURL();
            });

            // reload doc
            $scope.api.reload = function () {
                createBaseURL();
                noCache();
            };
        },
        templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
})