angular.module('pdfviewerPdfJsViewer', ['servoy']).directive('pdfviewerPdfJsViewer', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel',
            api: "=svyApi"
        },
        link: function($scope, $element, $attrs) {
            $scope.iframeURL = '';
            $scope.documentURL = '';
            $scope.pageNumber = '';
            $scope.zoomLevel = '';
            $scope.noCache = '';
            $scope.showToolbar = '';
            $scope.viewerState = '';
        },
        controller: function($scope, $element, $timeout, $sce) {

            $scope.renderFinished = function() {
                var iframe = $element.find("iframe")[0];
                $(iframe).on('load', function() {
                    var viewer = iframe.contentWindow.PDFViewerApplication;
                    viewer.initializedPromise.then(() => {
                        if ($scope.showToolbar !== $scope.model.showToolbar) {
                            onShowToolbarChanged();
                        }
                        hideToolbarControls();
                        viewer.eventBus.on("pagerendered", () => {
                            if ($scope.model.enableTooltips) enableTooltips();
                            else disableTooltips();
                            fillOutFormFields();
                            hideFieldControls();
                        })
                    });
                });
            }

            // reload doc
            $scope.api.reload = function() {
                $timeout(function() {
                    var iframe = $element.find("iframe")[0];
                    var url = iframe.src;
                    iframe.src = 'about:blank';
                    $timeout(function() {
                        iframe.src = url;
                    }, 5);
                });
            };

            // load doc
            function createBaseURL() {
                $scope.documentURL = "pdfviewer/pdfJsViewer/pdfjs_2.9/web/viewer.html";
                if ($scope.model.dataProviderID && $scope.model.dataProviderID.url) {
                    var serverUrl = window.location.href.split('/solutions/')[0];
                    $scope.documentURL += "?file=" + serverUrl + '/' + encodeURIComponent($scope.model.dataProviderID.url);
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
                    // wait for the markup id
                    $timeout(function() {
                        var iframe = $element.find("iframe")[0];
                        $(iframe).on('load', function(event) {
                            var link = document.createElement("link");
                            var serverUrl = window.location.href.split('/solutions/')[0];
                            link.href = serverUrl + '/' + $scope.model.styleSheet;
                            link.rel = "stylesheet";
                            link.type = "text/css";
                            frames[0].document.head.appendChild(link);
                        });
                    })
                }
            }


            function onShowToolbarChanged() {
                let iframe = $element.find("iframe")[0];
                if (iframe != null) {
                    let toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
                    if (toolbar) {
                        toolbar.style.display = $scope.model.showToolbar ? "inline" : "none";
                        $scope.showToolbar = $scope.model.showToolbar
                    }
                }
            }

            async function enableTooltips() {
                const iframe = $element.find("iframe")[0];
                if (!iframe) return;
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (!pdf) return;

                const tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
                if (tooltipTexts.length > 0) {
                    return;
                }

                let elements = iframe.contentWindow.document.getElementsByClassName('textWidgetAnnotation');
                // TODO: implement tooltips for buttonWidgetAnnotations: let cbElements = iframe.contentWindow.document.getElementsByClassName('buttonWidgetAnnotation');
                let elementsMap = new Map()
                for (let e = 0; e < elements.length; e++) {
                    let element = elements[e];
                    let name = element.firstChild.name;
                    elementsMap.set(name, element);
                }

                const annotations = await pdf.getFieldObjects();
                for (let p = 1; p <= pdf.numPages; p++) {
                    let page = await pdf.getPage(p);
                    let pageAnnotations = await page.getAnnotations();

                    for (let a = 0; a < pageAnnotations.length; a++) {
                        let name = pageAnnotations[a].fieldName;
                        if (annotations[name] && elementsMap.get(name)) {
                            let element = elementsMap.get(name);
                            element.classList.add("tooltip");
                            let x = iframe.contentWindow.document.createElement("SPAN");
                            x.classList.add("tooltiptext");
                            let tooltipText = pageAnnotations[a].alternativeText ? pageAnnotations[a].alternativeText : pageAnnotations[a].fieldName;
                            let t = iframe.contentWindow.document.createTextNode(tooltipText);
                            x.appendChild(t);
                            element.appendChild(x);
                        }
                    }
                }
            };

            async function disableTooltips() {
                const iframe = $element.find("iframe")[0];
                if (!iframe) return;
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (!pdf) return;

                let tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
                while (tooltipTexts.length > 0) {
                    tooltipTexts[0].remove();
                }

                let annotations = iframe.contentWindow.document.getElementsByClassName('tooltip');
                while (annotations.length > 0) {
                    annotations[0].classList.remove('tooltip');
                }

            }

            async function fillOutFormFields() {
                if (!$scope.model.fieldValues) return;
                const iframe = $element.find("iframe")[0];
                if (!iframe) return;
                let pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (!pdf) return;

                const annotationStorage = pdf.annotationStorage;
                const fieldObjects = await pdf.getFieldObjects();
                if (!fieldObjects) return;

                Object.keys($scope.model.fieldValues).forEach((key) => {
                    if (fieldObjects[key]) {
                        let id = fieldObjects[key][0].id;
                        let element = iframe.contentWindow.document.getElementById(id);
                        if (element) {
                            if (fieldObjects[key][0].type == 'text')
                                element.value = $scope.model.fieldValues[key];
                            else if (fieldObjects[key][0].type == 'checkbox')
                                element.checked = $scope.model.fieldValues[key];
                            else {
                                console.warn('Cannot fill out form field: Only text and checkbox input types are currently implemented.');
                                return;
                            }
                        }
                        annotationStorage.setValue(id, { value: $scope.model.fieldValues[key] });
                    }
                });
            }

            function hideToolbarControls() {
                if ($scope.model.toolbarControlsVisibility) {
                    const iframe = $element.find("iframe")[0];
                    if (!iframe) {
                        return;
                    }
                    Object.keys($scope.model.toolbarControlsVisibility).forEach((id) => {
                        let element = iframe.contentWindow.document.getElementById(id);
                        if (element) {
                            element.hidden = !$scope.model.toolbarControlsVisibility[id];
                        }
                    });
                }
            }

            function hideFieldControls() {
                if ($scope.model.fieldControlsVisibility) {
                    const iframe = $element.find("iframe")[0];
                    const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                    if (!pdf) {
                        return;
                    }
                    Object.keys($scope.model.fieldControlsVisibility).forEach((name) => {
                        let element = iframe.contentWindow.document.getElementsByName(name);
                        if (element && element.length) {
                            element[0].hidden = !$scope.model.fieldControlsVisibility[name];
                        }
                    });
                }
            }

            $scope.api.getFieldValues = async () => {
                const iframe = $element.find("iframe")[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                const annotationStorage = pdf.annotationStorage;
                const fieldValues = {};

                const annotations = await pdf.getFieldObjects();
                Object.keys(annotations).forEach((key) => {
                    let annotation = annotations[key][0];
                    if (annotation.name) {
                        let id = annotation.id
                        let value = null
                        if (annotationStorage.getValue(id)) {
                            value = annotationStorage.getValue(id).value;
                        }

                        fieldValues[key] = value;
                    }
                });

                return fieldValues;
            };

            $scope.api.getFieldNames = async () => {
                const iframe = $element.find("iframe")[0];
                if (!iframe) return null;
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (!pdf) return null;

                const fieldNames = [];
                let annotations = await pdf.getFieldObjects();
                Object.keys(annotations).forEach((key) => {
                    let annotation = annotations[key][0];
                    if (annotation.name) {
                        // which is correct version?
                        //fieldNames.push(annotation.name);
                        fieldNames.push(key);
                    }
                });
                return fieldNames;
            };

            $scope.api.getToolbarControlIds = function() {
                const iframe = $element.find("iframe")[0];
                if (!iframe) {
                    return null;
                }

                let toolbarViewer = iframe.contentWindow.document.getElementById('toolbarViewer');
                if (!toolbarViewer)
                    return null;
                let toolbarSections = toolbarViewer.children;
                let controls = [];
                for (let i = 0; i < toolbarSections.length; i++) {
                    controls = controls.concat(Array.from(toolbarSections[i].children));
                }
                let ids = new Array();
                for (let i = 0; i < controls.length; i++) {
                    if (controls[i].id) {
                        ids.push(controls[i].id);
                    }
                }
                return ids;
            }

            $scope.$watch('[documentURL, pageNumber, zoomLevel, noCache]', function(newValues, oldValues, scope) {
                if (!newValues[0]) {
                    return
                }

                var url = newValues.shift();
                newValues = newValues.filter(function(item) {
                    return (item != null && item != '');
                });
                if (newValues.length > 0) url += '#' + newValues.join('&');
                $scope.iframeURL = $sce.trustAsResourceUrl(url);
                console.debug('Rendering iframe pdf with URL: ' + $scope.iframeURL);
            })

            $scope.$watch('model.noCache', function(newValue, oldValue) {
                noCache();
            });

            $scope.$watch('model.zoomLevel', function(newValue, oldValue) {
                zoomLevel();
            });

            $scope.$watch('model.pageNumber', function(newValue, oldValue) {
                setPageNumer();
            });
            // watch doc url
            $scope.$watch('model.documentURL', function(newValue, oldValue) {
                const iframe = $element.find("iframe")[0];
                if (iframe == null) $scope.viewerState = 0;
                else $scope.viewerState = 1;
                createBaseURL();
            });

            $scope.$watch('model.dataProviderID', function(newValue, oldValue) {
                const iframe = $element.find("iframe")[0];
                if (iframe == null) $scope.viewerState = 0;
                else $scope.viewerState = 1;
                createBaseURL();
            });

            $scope.$watch('model.visible', function(newValue, oldValue) {
                addCustomCSS();
            });

            $scope.$watch('model.showToolbar', function(newValue, oldValue) {
                onShowToolbarChanged()
            });

            $scope.$watch('model.enableTooltips', function(newValue, oldValue) {
                if (newValue) enableTooltips();
                else disableTooltips();
            });

            $scope.$watch('model.fieldValues', function() {
                fillOutFormFields();
            });

            $scope.$watch('model.toolbarControlsVisibility', function() {
                hideToolbarControls();
            });

            $scope.$watch('model.fieldControlsVisibility', function() {
                hideFieldControls();
            });

            $scope.onTabSequenceRequest = function() {
                $timeout(function() {
                    var iframe = $element.find("iframe")[0];
                    iframe.contentWindow.focus();
                });
            }
        },
        templateUrl: 'pdfviewer/pdfJsViewer/pdfJsViewer.html'
    };
})




