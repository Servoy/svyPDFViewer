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
            $scope.showToolbar = '';
            $scope.enableTooltips = '';
            $scope.viewerState = '';
        },
        controller: function ($scope, $element, $attrs, $timeout, $sce) {
            // reload doc
            $scope.api.reload = function () {
                $timeout(function () {
                    var iframe = $element.find("iframe")[0];
                    var url = iframe.src;
                    iframe.src = 'about:blank';
                    $timeout(function () {
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

            async function onUrlSet() {
                $timeout(function () {
                    var iframe = $element.find("iframe")[0];
                    $(iframe).on('load', function (event) {
                        applyProperties();
                    });
                })
                /*if ($scope.viewerState == 0 || $scope.viewerState == '') {
                    const iframeTimeout = setTimeout(() => {
                        applyProperties();
                    }, 200)
                } else {
                    applyProperties();
                }*/
                /*iframe.contentWindow.PDFViewerApplication.eventBus._dispatchToDOM = true;
                iframe.contentWindow.PDFViewerApplication.eventBus.on('documentloaded', (e) => {
                    //window.addEventListener('documentloaded', () => {
                    console.log('doc loaded');
                })
                iframe.contentWindow.PDFViewerApplication.eventBus.on('pagesloaded', (e) => {
                    console.log('pages loaded');
                })
                iframe.contentDocument.addEventListener("documentloaded", () => {
                    console.log('doc loaded');
                })
                iframe.addEventListener("documentloaded", () => {
                    console.log('doc loaded');
                })
                iframe.contentDocument.onload = () => {
                    console.log('doc loaded');
                }*/
                
            }

            async function applyProperties() {
                let iframe = $element.find("iframe")[0];
                let viewer = iframe.contentWindow.PDFViewerApplication;
                viewer.initializedPromise.then(() => {
                    viewer.eventBus.on("documentinit", (e) => {
                        console.log("document initiated");
                        $timeout(() => {
                            
                            if ($scope.showToolbar !== $scope.model.showToolbar) {
                                onShowToolbarChanged();
                            }
                            
                            
                            if ($scope.model.enableTooltips) enableTooltips();
                            else if (!$scope.model.enableTooltips) disableTooltips();
                        }, 100)
                    })
                });
            }

            /*async function loadDocucument() {
                $scope.documentURL = "pdfviewer/pdfJsViewer/pdfjs_2.9/web/viewer.html";
                if ($scope.model.dataProviderID && $scope.model.dataProviderID.url) {
                    var serverUrl = window.location.href.split('/solutions/')[0];
                    $scope.documentURL += "?file=" + serverUrl + '/' + encodeURIComponent($scope.model.dataProviderID.url);
                    const iframe = $element.find("iframe")[0];
                    const lib = iframe.contentWindow['pdfjs-dist/build/pdf'];
                    //const serverUrl = window.location.href.split('/solutions/')[0];
                    const url = serverUrl + '/' + $scope.model.dataProviderID.url.split('&')[0];
                    var pdf = await lib.getDocument(url).promise;
                }
            }*/

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

            async function fillOutFormFields(pdf, values, iframe) {
                const annotationStorage = pdf.annotationStorage;
                const fieldObjects = await pdf.getFieldObjects();

                const fields = {};
                Object.keys(fieldObjects).forEach((name) => {
                    let fieldObject = fieldObjects[name];
                    fields[fieldObject[0].name] = fieldObject[0].id;
                });

                Object.keys(values).forEach((key) => {
                    console.log(values[key]);
                    if (fields[key]) {
                        let id = fields[key];
                        let element = iframe.contentWindow.document.getElementById(id);
                        if (fieldObjects[key][0].type == 'text')
                            element.value = values[key];
                        else if (fieldObjects[key][0].type == 'checkbox')
                            element.checked = values[key];
                        else {
                            console.log('Cannot fill out form field: Only text and checkbox input types are currently implemented.');
                            return;
                        }
                        annotationStorage.setValue(fields[key], { value: values[key] });
                    }
                });
            }

            function onShowToolbarChanged() {
                $scope.showToolbar = $scope.model.showToolbar
                if (!$scope.dataProviderID && !$scope.documentURL) {
                    return;
                }
                let iframe = $element.find("iframe")[0];
                if (iframe != null) {
                    let toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
                    toolbar.style.display = $scope.showToolbar ? "inline" : "none";
                } else {
                    $timeout(function () {
                        var iframe = $element.find("iframe")[0];
                        $(iframe).on('load', function (event) {
                            let toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
                            toolbar.style.display = $scope.showToolbar ? "inline" : "none";
                        });
                    })
                }
            }

            async function enableTooltips() {
                if ($scope.enableTooltips == true) {
                    //return;
                }
                $scope.enableTooltips = true;
                const iframe = $element.find("iframe")[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (pdf == null) {
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

                let tooltipElements = iframe.contentWindow.document.querySelectorAll(".tooltip");
                tooltipElements.forEach(function (tooltipField, index) {
                    tooltipField.addEventListener("mouseover", position_tooltip);
                })

                /*function position_tooltip() {
                    let tooltip = this.parentNode.querySelector(".tooltiptext");

                    // Get calculated ktooltip coordinates and size
                    var field_rect = this.getBoundingClientRect();

                    var tipX = field_rect.width + 5; // 5px on the right of the tooltip
                    var tipY = -40;                     // 40px on the top of the tooltip
                    // Position tooltip
                    tooltip.style.top = tipY + 'px';
                    tooltip.style.left = tipX + 'px';

                    // Get calculated tooltip coordinates and size
                    var tooltip_rect = tooltip.getBoundingClientRect();
                    // Corrections if out of window
                    if ((tooltip_rect.x + tooltip_rect.width) > iframe.contentWindow.innerWidth) // Out on the right
                        tipX = -tooltip_rect.width - 5;  // Simulate a "right: tipX" position
                    if (tooltip_rect.y < 0)            // Out on the top
                        tipY = tipY - tooltip_rect.y;    // Align on the top

                    // Apply corrected position
                    tooltip.style.top = tipY + 'px';
                    tooltip.style.left = tipX + 'px';
                }*/
            };

            async function disableTooltips() {
                if (!$scope.enableTooltips) {
                    return;
                }
                $scope.enableTooltips = false;

                const iframe = $element.find("iframe")[0];
                iframe.contentWindow.enableTooltips = false;
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (pdf == null) {
                    return;
                }

                let tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
                while (tooltipTexts.length > 0) {
                    tooltipTexts[0].remove();
                }

                let annotations = iframe.contentWindow.document.getElementsByClassName('tooltip');
                while (annotations.length > 0) {
                    annotations[0].classList.remove('tooltip');
                }

            }

            function isDocumentReady() {
                const iframe = $element.find("iframe")[0];
                if (iframe == null) return false;
                
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (pdf == null) return false;

                return true;
            }

            /*$scope.api.loadDocument = async (documentURL, values, staticForm) => {
                const iframe = $element.find("iframe")[0];
                const lib = iframe.contentWindow['pdfjs-dist/build/pdf'];
                const serverUrl = window.location.href.split('/solutions/')[0];
                const url = serverUrl + '/' + documentURL;
                console.log(url);
                //const url = serverUrl + '/' + $scope.model.dataProviderID.url.split('&')[0];
                const realUrl = serverUrl + '/' + $scope.model.dataProviderID.url.split('&')[0];
                console.log(realUrl);
                const pdf = await lib.getDocument(url).promise;
                const annotationStorage = pdf.annotationStorage;
                const fieldObjects = await pdf.getFieldObjects();

                //if (!values) {
                //    return;
                //}
                //setTimeout(() => {
                //    fillOutFormValues(fieldObjects, values, iframe, annotationStorage);
                //}, 1000)
                
            }*/

            $scope.api.getFieldValues = async () => {
                const iframe = $element.find("iframe")[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                const annotationStorage = pdf.annotationStorage._storage;
                const fieldValues = {};

                const annotations = await pdf.getFieldObjects();
                Object.keys(annotations).forEach((key) => {
                    let annotation = annotations[key][0];
                    if (annotation.name) {
                        let id = annotation.id
                        let value = null
                        if (annotationStorage.get(id)) {
                            value = annotationStorage.get(id).value;
                        }

                        fieldValues[annotation.name] = value;
                    }
                });

                return fieldValues;
            };

            $scope.api.setFieldValues = async (values, timeout) => {
                const iframe = $element.find("iframe")[0];
                let pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (!timeout) timeout = 200;
                if (pdf == null) {
                    setTimeout(() => {
                        pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                        fillOutFormFields(pdf, values, iframe);
                    }, timeout);
                } else {
                    fillOutFormFields(pdf, values, iframe);
                }
            };

            $scope.api.getFieldNames = async () => {
                const iframe = $element.find("iframe")[0];
                //const lib = iframe.contentWindow['pdfjs-dist/build/pdf'];
                //const serverUrl = window.location.href.split('/solutions/')[0];
                //const url = serverUrl + '/' + $scope.model.dataProviderID.url.split('&')[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                //var pdf = await lib.getDocument(url).promise;

                const fieldNames = [];
                let annotations = await pdf.getFieldObjects();
                Object.keys(annotations).forEach((key) => {
                    let annotation = annotations[key][0];
                    if (annotation.name) {
                        fieldNames.push(annotation.name);
                    }
                });


                return fieldNames;
            };

            $scope.api.getControlIds = function () {
                const iframe = $element.find("iframe")[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (pdf == null) {
                    return;
                }

                let toolbarViewer = iframe.contentWindow.document.getElementById('toolbarViewer');
                let toolbarSections = toolbarViewer.children;
                let controls = [];
                for (let i = 0; i < toolbarSections.length; i++) {
                    controls = controls.concat(Array.from(toolbarSections[i].children));
                }
                let ids = [];
                let j = 0;
                for (let i = 0; i < controls.length; i++) {
                    if (controls[i].id) {
                        ids[j] = controls[i].id;
                        j++;
                        console.log(controls[i].id);
                    }
                }
                return ids;
            }

            $scope.api.setControlsVisibility = function (ids, visible) {
                const iframe = $element.find("iframe")[0];
                const pdf = iframe.contentWindow.PDFViewerApplication.pdfDocument;
                if (pdf == null) {
                    return;
                }
                ids.forEach((id) => {
                    let element = iframe.contentWindow.document.getElementById(id);
                    if (element) {
                        element.hidden = !visible;
                    }
                });
            }

            $scope.$watch('[documentURL, pageNumber, zoomLevel, noCache]', function (newValues, oldValues, scope) {
                if (!newValues[0]) {
                    return
                }

                var url = newValues.shift();
                newValues = newValues.filter(function (item) {
                    return (item != null && item != '');
                });
                if (newValues.length > 0) url += '#' + newValues.join('&');
                $scope.iframeURL = $sce.trustAsResourceUrl(url);
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
                const iframe = $element.find("iframe")[0];
                if (iframe == null) $scope.viewerState = 0;
                else $scope.viewerState = 1;
                createBaseURL();
                onUrlSet();
            });

            $scope.$watch('model.dataProviderID', function (newValue, oldValue) {
                const iframe = $element.find("iframe")[0];
                if (iframe == null) $scope.viewerState = 0;
                else $scope.viewerState = 1;
                createBaseURL();
                onUrlSet();
            });

            $scope.$watch('model.visible', function (newValue, oldValue) {
                addCustomCSS();
            });

            $scope.$watch('model.showToolbar', function (newValue, oldValue) {
                onShowToolbarChanged()
            });

            $scope.$watch('model.enableTooltips', function (newValue, oldValue) {
                if (!isDocumentReady()) {
                    return;
                }
                if (newValue) enableTooltips();
                else if (!newValue) disableTooltips();
            });

            $scope.onTabSequenceRequest = function () {
                $timeout(function () {
                    var iframe = $element.find("iframe")[0];
                    iframe.contentWindow.focus();
                });
            }
        },
        templateUrl: 'pdfviewer/pdfJsViewer/pdfJsViewer.html'
    };
})




