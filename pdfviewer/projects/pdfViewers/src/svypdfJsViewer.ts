import { LoggerFactory, LoggerService, ServoyBaseComponent, WindowRefService } from '@servoy/public';
import { Component, Input, Renderer2, ChangeDetectorRef, ElementRef, SimpleChanges, ViewChild } from '@angular/core';

@Component({
    selector: 'pdfviewer-pdf-Js-Viewer',
    template: `
        <div [ngClass]="styleClass" style="height: 100%; width: 100%" [id]="servoyApi.getMarkupId()" [sabloTabseq]="tabSeq" (focus)="onTabSequenceRequest()" #element>
            <iframe #iframe [src]="iframeURL | safe" (load)="documentLoaded()" style="width:100%; height:100%" ></iframe>
        </div> `,
})
export class SvyPdfJsViewer extends ServoyBaseComponent<HTMLDivElement> {

    @ViewChild('iframe', { read: ElementRef }) iframeElementRef: ElementRef;

    @Input() documentURL: string;
    @Input() noCache: boolean;
    @Input() dataProviderID: any;
    @Input() tabSeq: number;
    @Input() styleClass: string;
    @Input() visible: boolean;
    @Input() zoomLevel: string;
    @Input() pageNumber: number;
    @Input() styleSheet: string;
    @Input() showToolbar: boolean;
    @Input() enableTooltips: boolean;
    @Input() fieldValues: { property: any };
    @Input() toolbarControlsVisibility: { property: boolean };
    @Input() fieldControlsVisibility: { property: boolean };

    log: LoggerService;
    noCacheVar = '';
    documentUrlVar = '';
    zoomLevelVar = '';
    pageNumberVar = '';
    iframeURL = '';

    constructor(renderer: Renderer2, protected cdRef: ChangeDetectorRef,
        private windowRef: WindowRefService, logFactory: LoggerFactory) {
        super(renderer, cdRef);
        this.log = logFactory.getLogger('SvyPdfJsViewer');
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.servoyApi.isInDesigner()) {
            setTimeout(() => {
                const iframe = this.iframeElementRef.nativeElement;
                iframe.setAttribute('src', 'pdfjs/web/viewer.html');
                iframe.removeAttribute('hidden');
            }, 0);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const entry of Object.entries(changes)) {
                if (entry[1].currentValue !== entry[1].previousValue) {
                    switch (entry[0]) {
                        case 'noCache':
                            this.setNoCache();
                            break;
                        case 'documentURL':
                            this.createBaseURL();
                            break;
                        case 'dataProviderID':
                            this.createBaseURL();
                            break;
                        case 'zoomLevel':
                            this.setZoomLevel();
                            break;
                        case 'pageNumber':
                            this.setPageNumber();
                            break;
                        case 'styleSheet':
                        case 'visible':
                            this.addCustomCSS();
                            break;
                        case 'showToolbar':
                            this.onShowToolbarChanged();
                            break;
                        case 'enableTooltips':
                            if (this.enableTooltips) this.enableTooltipsUI();
                            else this.disableTooltips();
                            break;
                        case 'fieldValues':
                            this.fillOutFormFields();
                            break;
                        case 'toolbarControlsVisibility':
                            this.hideToolbarControls();
                            break;
                        case 'fieldControlsVisibility':
                            this.hideFieldControls();
                            break;
                    }
                }
            }
        }
    }

    documentLoaded() {
        const viewer = this.iframeElementRef?.nativeElement?.contentWindow?.PDFViewerApplication;
        if (viewer) viewer.initializedPromise.then(() => {
            this.onShowToolbarChanged();
            this.hideToolbarControls();
            viewer.eventBus.on("textlayerrendered", () => {
                if (this.enableTooltips) this.enableTooltipsUI();
                else this.disableTooltips();
                this.fillOutFormFields();
                this.hideFieldControls();
            })
        });
    }

    getIframe() {
        return this.iframeElementRef?.nativeElement;
    }

    getPDFDocument() {
        const iframe = this.getIframe();
        if (iframe)
            return (iframe.contentWindow as any)?.PDFViewerApplication.pdfDocument;
        return null;
    }

    createBaseURL() {
        this.documentUrlVar = 'pdfjs/web/viewer.html';
        if (this.dataProviderID && this.dataProviderID.url) {
            const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
            this.documentUrlVar += '?file=' + serverURL + '/' + encodeURIComponent(this.dataProviderID.url);
        } else if (this.documentURL) {
            // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
            this.documentUrlVar += '?file=' + this.documentURL;
        } else {
            this.iframeURL = 'pdfjs/web/viewer.html';
            return false;
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
        return false;
    }

    setNoCache() {
        // check for noCache and generate random http param
        if (this.noCache === true) {
            const r = Math.round(Math.random() * 10000000);
            this.noCacheVar = 'r=' + r;
        } else {
            this.noCacheVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    setZoomLevel() {
        if (this.zoomLevel != null) {
            this.zoomLevelVar = 'zoom=' + this.zoomLevel;
        } else {
            this.zoomLevelVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    setPageNumber() {
        if (this.pageNumber != null && this.pageNumber >= 1) {
            this.pageNumberVar = 'page=' + this.pageNumber;
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    addCustomCSS() {
        // add custom CSS to the iframe
        if (this.styleSheet) {
            setTimeout(() => {
                this.renderer.listen(this.getIframe(), 'load', () => {
                    const link = document.createElement('link');
                    const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
                    link.href = serverURL + '/' + this.styleSheet;
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    (this.getIframe() as HTMLIFrameElement).contentDocument.head.appendChild(link);
                });
            });
        }
    }

    /**
     * The first parameter of the newValues array should be 'documentURL'
     *
     * @param newValues
     */
    updateIframeURL(newValues: any[]) {
        if (!newValues[0]) {
            return;
        }
        const url = newValues.shift();
        newValues = newValues.filter((item) => (item != null && item !== '')
        );
        this.iframeURL = url + '#' + newValues.join('&');
        this.log.debug('Rendering iframe pdf with URL: ' + this.iframeURL);
    }

    reload() {
        setTimeout(() => {
            const iframe = this.getIframe();
            const url = iframe.src;
            this.renderer.setAttribute(iframe, 'src', 'about:blank');
            setTimeout(() => {
                this.renderer.setAttribute(iframe, 'src', url);
            }, 5);
        });
    }

    onShowToolbarChanged() {
        const iframe = this.getIframe();
        if (iframe) {
            let toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
            if (toolbar) {
                toolbar.style.display = this.showToolbar ? "inline" : "none";
            }
        }
    }
    hideToolbarControls() {
        if (!this.toolbarControlsVisibility) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(this.toolbarControlsVisibility).forEach((id) => {
            const element = iframe.contentWindow.document.getElementById(id);
            if (element) {
                element.hidden = !this.toolbarControlsVisibility[id];
            }
        });
    }

    hideFieldControls() {
        if (!this.fieldControlsVisibility) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(this.fieldControlsVisibility).forEach((name) => {
            const element = iframe.contentWindow.document.getElementsByName(name);
            if (element && element.length) {
                element[0].hidden = !this.fieldControlsVisibility[name];
            }
        });
    }
    
    async enableTooltipsUI() {
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
        if (!pdf) return;

        let tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
        if (tooltipTexts.length > 0) {
            return;
        }

        let elements = iframe.contentWindow.document.getElementsByClassName('textWidgetAnnotation');
        // TODO: implement tooltips for buttonWidgetAnnotations: let cbElements = iframe.contentWindow.document.getElementsByClassName('buttonWidgetAnnotation');
        let elementsMap = new Map()
        for (let e = 0; e < elements.length; e++) {
            let element = elements[e];
            let name = (element.firstChild as HTMLFormElement).name;
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

    async disableTooltips() {
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
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

    async fillOutFormFields() {
        if (!this.fieldValues) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
        if (!pdf) return;

        const annotationStorage = pdf.annotationStorage;
        const fieldObjects = await pdf.getFieldObjects();

        if (!fieldObjects) return;
        const fields = {};
        Object.keys(fieldObjects).forEach((name) => {
            let fieldObject = fieldObjects[name];
            fields[name] = fieldObject[0].id;
        });

        Object.keys(this.fieldValues).forEach((key) => {
            if (fields[key]) {
                let element = iframe.contentWindow.document.getElementsByName(key)[0];
                if (element) {
                    if (fieldObjects[key][0].type == 'text')
                        (element as HTMLInputElement).value = this.fieldValues[key];
                    else if (fieldObjects[key][0].type == 'checkbox')
                        (element as HTMLInputElement).checked = this.fieldValues[key];
                    else {
                        console.warn('Cannot fill out form field: Only text and checkbox input types are currently implemented.');
                        return;
                    }
                }
                annotationStorage.setValue(fields[key], { value: this.fieldValues[key] });
            }
        });
    }

    public async getFieldValues() {
        const pdf = this.getPDFDocument();
        const annotationStorage = pdf.annotationStorage;
        const fieldValues = {};

        const annotations = await pdf.getFieldObjects();
        Object.keys(annotations).forEach((key) => {
            let annotation = annotations[key][0];
            if (annotation.name) {
                let id = annotation.id
                let value = null
                if (annotationStorage.getRawValue(id)) {
                    value = annotationStorage.getRawValue(id).value;
                }

                fieldValues[key] = value;
            }
        });

        return fieldValues;
    };

    public async getFieldNames() {
        const pdf = this.getPDFDocument();
        if (!pdf) return null;

        const fieldNames = [];
        let annotations = await pdf.getFieldObjects();
        Object.keys(annotations).forEach((key) => {
            let annotation = annotations[key][0];
            if (annotation.name) {
                //fieldNames.push(annotation.name);
                // why key and name are sometimes different? which is the correct one
                fieldNames.push(key)
            }
        });
        return fieldNames;
    };

    public getToolbarControlIds(): Array<string> {
        const iframe = this.getIframe();
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

    onTabSequenceRequest() {
        setTimeout(() => {
            this.getIframe().contentWindow.focus();
        });
    }
}
