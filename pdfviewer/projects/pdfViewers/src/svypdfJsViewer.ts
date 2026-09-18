import { LoggerFactory, LoggerService, ServoyBaseComponent, WindowRefService, ServoyPublicModule } from '@servoy/public';
import { Component, SimpleChanges, ViewChild, ChangeDetectionStrategy, ElementRef, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safePipe';

@Component({
    selector: 'pdfviewer-pdf-Js-Viewer',
    template: `
        <div [ngClass]="styleClass()" style="height: 100%; width: 100%" [id]="servoyApi().getMarkupId()" [sabloTabseq]="tabSeq()" (focus)="onTabSequenceRequest()" #element>
            <iframe #iframe [src]="iframeURL() | safe" (load)="documentLoaded()" style="width:100%; height:100%" ></iframe>
        </div> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ServoyPublicModule, SafePipe]
})
export class SvyPdfJsViewer extends ServoyBaseComponent<HTMLDivElement> {

    @ViewChild('iframe', { read: ElementRef }) iframeElementRef!: ElementRef;

    readonly documentURL = input<string>(undefined as any);
    readonly noCache = input<boolean>(undefined as any);
    readonly dataProviderID = input<any>(undefined as any);
    readonly tabSeq = input<number>(undefined as any);
    readonly styleClass = input<string>(undefined as any);
    readonly visible = input<boolean>(undefined as any);
    readonly zoomLevel = input<string>(undefined as any);
    readonly pageNumber = input<number>(undefined as any);
    readonly styleSheet = input<string>(undefined as any);
    readonly showToolbar = input<boolean>(undefined as any);
    readonly enableTooltips = input<boolean>(undefined as any);
    readonly fieldValues = input<{ [property: string]: any }>(undefined as any);
    readonly toolbarControlsVisibility = input<{ [property: string]: boolean }>(undefined as any);
    readonly fieldControlsVisibility = input<{ [property: string]: boolean }>(undefined as any);
    readonly onPageChanged = input<(pageNumber: number, previousPageNumber: number) => void>(undefined as any);

    private readonly windowRef = inject(WindowRefService);
    private readonly logFactory = inject(LoggerFactory);

    log: LoggerService;
    noCacheVar = '';
    documentUrlVar = '';
    zoomLevelVar = '';
    pageNumberVar = '';
    readonly iframeURL = signal('');

    constructor() {
        super();
        this.log = this.logFactory.getLogger('SvyPdfJsViewer');
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.servoyApi().isInDesigner()) {
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
                            if (this.enableTooltips()) this.enableTooltipsUI();
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
                if (this.enableTooltips()) this.enableTooltipsUI();
                else this.disableTooltips();
                this.hideFieldControls();
            });
            viewer.eventBus.on("annotationlayerrendered", () => {
                this.fillOutFormFields();
                this.hideFieldControls();
            });
            const onPageChanged = this.onPageChanged();
            if (onPageChanged) {
                viewer.eventBus.on("pagechanging", (evt: any) => {
                    onPageChanged(evt.pageNumber, evt.previous);
                });
            }
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
        const dataProviderID = this.dataProviderID();
        if (dataProviderID && dataProviderID.url) {
            const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
            this.documentUrlVar += '?file=' + serverURL + '/' + encodeURIComponent(dataProviderID.url);
        } else if (typeof dataProviderID === 'string') {
            // if this is just a string the we assume this is a direct url and we will show this
            this.documentUrlVar += '?file=' + dataProviderID;
        } else if (this.documentURL()) {
            // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
            this.documentUrlVar += '?file=' + this.documentURL();
        } else {
            this.iframeURL.set('pdfjs/web/viewer.html');
            return false;
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
        return false;
    }

    setNoCache() {
        // check for noCache and generate random http param
        if (this.noCache() === true) {
            const r = Math.round(Math.random() * 10000000);
            this.noCacheVar = 'r=' + r;
        } else {
            this.noCacheVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    setZoomLevel() {
        if (this.zoomLevel() != null) {
            this.zoomLevelVar = 'zoom=' + this.zoomLevel();
        } else {
            this.zoomLevelVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    setPageNumber() {
        const pageNumber = this.pageNumber();
        if (pageNumber != null && pageNumber >= 1) {
            this.pageNumberVar = 'page=' + pageNumber;
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    addCustomCSS() {
        // add custom CSS to the iframe
        const styleSheet = this.styleSheet();
        if (styleSheet) {
            setTimeout(() => {
                this.getRenderer().listen(this.getIframe(), 'load', () => {
                    const link = document.createElement('link');
                    const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
                    link.href = serverURL + '/' + styleSheet;
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    (this.getIframe() as HTMLIFrameElement).contentDocument?.head.appendChild(link);
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
        this.iframeURL.set(url + '#' + newValues.join('&'));
        this.log.debug('Rendering iframe pdf with URL: ' + this.iframeURL());
    }

    reload() {
        setTimeout(() => {
            const iframe = this.getIframe();
            const url = iframe.src;
            this.getRenderer().setAttribute(iframe, 'src', 'about:blank');
            setTimeout(() => {
                this.getRenderer().setAttribute(iframe, 'src', url);
            }, 5);
        });
    }

    onShowToolbarChanged() {
        const iframe = this.getIframe();
        if (iframe) {
            let toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
            if (toolbar) {
                toolbar.style.display = this.showToolbar() ? "block" : "none";
            }
        }
    }
    hideToolbarControls() {
        const toolbarControlsVisibility = this.toolbarControlsVisibility();
        if (!toolbarControlsVisibility) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(toolbarControlsVisibility).forEach((id) => {
            const element = iframe.contentWindow.document.getElementById(id);
            if (element) {
                element.hidden = !toolbarControlsVisibility[id];
            }
        });
    }

    hideFieldControls() {
        const fieldControlsVisibility = this.fieldControlsVisibility();
        if (!fieldControlsVisibility) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(fieldControlsVisibility).forEach((name) => {
            const element = iframe.contentWindow.document.getElementsByName(name);
            if (element && element.length) {
                (element[0] as HTMLElement).hidden = !fieldControlsVisibility[name];
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
        let elementsMap = new Map<string, Array<Element>>()
        for (let e = 0; e < elements.length; e++) {
            let element = elements[e];
            let name = (element.firstChild as HTMLFormElement).name;
            if (!elementsMap.has(name)) {
                elementsMap.set(name, []);
            }
            elementsMap.get(name)!.push(element);
        }

        const annotations = await pdf.getFieldObjects();
        for (let p = 1; p <= pdf.numPages; p++) {
            let page = await pdf.getPage(p);
            let pageAnnotations = await page.getAnnotations();

            for (let a = 0; a < pageAnnotations.length; a++) {
                let name = pageAnnotations[a].fieldName;
                if (annotations[name] && elementsMap.get(name)) {
                    elementsMap.get(name)!.forEach((element) => {
                        if (element.getElementsByClassName('tooltiptext').length > 0) {
                            return;
                        }
                        element.classList.add("tooltip");
                        let x = iframe.contentWindow.document.createElement("SPAN");
                        x.classList.add("tooltiptext");
                        let tooltipText = pageAnnotations[a].alternativeText ? pageAnnotations[a].alternativeText : pageAnnotations[a].fieldName;
                        let t = iframe.contentWindow.document.createTextNode(tooltipText);
                        x.appendChild(t);
                        element.appendChild(x);
                    });
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
        const fieldValues = this.fieldValues();
        if (!fieldValues) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
        if (!pdf) return;

        const annotationStorage = pdf.annotationStorage;
        const fieldObjects = await pdf.getFieldObjects();

        if (!fieldObjects) return;

        Object.keys(fieldValues).forEach((key) => {
            const fieldWidgets = fieldObjects[key];
            if (!fieldWidgets || !fieldWidgets.length) return;

            let handled = false;
            const rawValue = fieldValues[key];

            fieldWidgets.forEach((widget: any) => {
                if (widget.type == 'text') {
                    annotationStorage.setValue(widget.id, { value: this.toTextValue(rawValue) });
                    handled = true;
                } else if (widget.type == 'checkbox') {
                    annotationStorage.setValue(widget.id, { value: rawValue });
                    handled = true;
                }
            });

            const elements = iframe.contentWindow.document.getElementsByName(key);
            let hasElement = false;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLInputElement;
                const inputType = element.type;
                if (inputType == 'text' || inputType == 'textarea') {
                    element.value = this.toTextValue(rawValue);
                    handled = true;
                    hasElement = true;
                } else if (inputType == 'checkbox') {
                    element.checked = rawValue;
                    handled = true;
                    hasElement = true;
                } else {
                    continue;
                }
                const annotationId = this.getAnnotationId(element);
                if (annotationId) {
                    const value = inputType == 'checkbox' ? rawValue : this.toTextValue(rawValue);
                    annotationStorage.setValue(annotationId, { value });
                }
            }

            if (!handled && !hasElement) {
                console.warn('Cannot fill out form field "' + key + '": Only text and checkbox input types are currently implemented.');
            }
        });
    }

    private getAnnotationId(element: HTMLElement): string | null {
        let node: HTMLElement | null = element;
        while (node) {
            const id = node.getAttribute && node.getAttribute('data-annotation-id');
            if (id) return id;
            node = node.parentElement;
        }
        return null;
    }

    private toTextValue(value: any): any {
        if (value === null || value === undefined) return value;
        if (typeof value === 'boolean') return value;
        return String(value);
    }

    public async getFieldValues() {
        const pdf = this.getPDFDocument();
        const annotationStorage = pdf.annotationStorage;
        const iframe = this.getIframe();
        const fieldValues: { [key: string]: any } = {};

        const annotations = await pdf.getFieldObjects();
        Object.keys(annotations).forEach((key) => {
            const widgets = annotations[key];
            if (widgets && widgets.length && widgets[0].name) {
                let value = null;

                if (iframe) {
                    const elements = iframe.contentWindow.document.getElementsByName(key);
                    for (let i = 0; i < elements.length; i++) {
                        const annotationId = this.getAnnotationId(elements[i]);
                        if (!annotationId) continue;
                        const rawValue = annotationStorage.getRawValue(annotationId);
                        if (rawValue && rawValue.value !== undefined && rawValue.value !== null && rawValue.value !== '') {
                            value = rawValue.value;
                            break;
                        }
                    }
                }

                if (value === null) {
                    for (let i = 0; i < widgets.length; i++) {
                        const rawValue = annotationStorage.getRawValue(widgets[i].id);
                        if (rawValue && rawValue.value !== undefined && rawValue.value !== null && rawValue.value !== '') {
                            value = rawValue.value;
                            break;
                        }
                    }
                }

                if (value === null) {
                    const widgetWithValue = widgets.find((widget: any) => widget.value !== undefined && widget.value !== null && widget.value !== '');
                    value = widgetWithValue ? widgetWithValue.value : widgets[0].value;
                }

                fieldValues[key] = value;
            }
        });

        return fieldValues;
    };

    public async getFieldNames(): Promise<string[] | null> {
        const pdf = this.getPDFDocument();
        if (!pdf) return null;

        const fieldNames: string[] = [];
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

    public getToolbarControlIds(): Array<string> | null {
        const iframe = this.getIframe();
        if (!iframe) {
            return null;
        }

        let toolbarViewer = iframe.contentWindow.document.getElementById('toolbarViewer');
        if (!toolbarViewer)
            return null;
        let toolbarSections = toolbarViewer.children;
        let controls: Element[] = [];
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
