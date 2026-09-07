import { LoggerFactory, LoggerService, ServoyBaseComponent, WindowRefService } from '@servoy/public';
import { Component, SimpleChanges, ViewChild, ChangeDetectionStrategy, ElementRef, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServoyPublicModule } from '@servoy/public';
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
    readonly fieldValues = input<{ [key: string]: any }>(undefined as any);
    readonly toolbarControlsVisibility = input<{ [key: string]: boolean }>(undefined as any);
    readonly fieldControlsVisibility = input<{ [key: string]: boolean }>(undefined as any);
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
                this.fillOutFormFields();
                this.hideFieldControls();
            });
            if (this.onPageChanged()) {
                viewer.eventBus.on("pagechanging", (evt: any) => {
                    this.onPageChanged()(evt.pageNumber, evt.previous);
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
        if (this.dataProviderID() && this.dataProviderID().url) {
            const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
            this.documentUrlVar += '?file=' + serverURL + '/' + encodeURIComponent(this.dataProviderID().url);
        } else if (typeof this.dataProviderID() === 'string') {
            this.documentUrlVar += '?file=' + this.dataProviderID();
        } else if (this.documentURL()) {
            this.documentUrlVar += '?file=' + this.documentURL();
        } else {
            this.iframeURL.set('pdfjs/web/viewer.html');
            return false;
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
        return false;
    }

    setNoCache() {
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
        if (this.pageNumber() != null && this.pageNumber() >= 1) {
            this.pageNumberVar = 'page=' + this.pageNumber();
        }
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
    }

    addCustomCSS() {
        if (this.styleSheet()) {
            setTimeout(() => {
                this.getRenderer().listen(this.getIframe(), 'load', () => {
                    const link = document.createElement('link');
                    const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
                    link.href = serverURL + '/' + this.styleSheet();
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    (this.getIframe() as HTMLIFrameElement).contentDocument!.head.appendChild(link);
                });
            });
        }
    }

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
            const toolbar = iframe.contentWindow.document.getElementById("toolbarContainer");
            if (toolbar) {
                toolbar.style.display = this.showToolbar() ? "block" : "none";
            }
        }
    }
    hideToolbarControls() {
        if (!this.toolbarControlsVisibility()) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(this.toolbarControlsVisibility()).forEach((id) => {
            const element = iframe.contentWindow.document.getElementById(id);
            if (element) {
                element.hidden = !this.toolbarControlsVisibility()[id];
            }
        });
    }

    hideFieldControls() {
        if (!this.fieldControlsVisibility()) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        Object.keys(this.fieldControlsVisibility()).forEach((name) => {
            const element = iframe.contentWindow.document.getElementsByName(name);
            if (element && element.length) {
                element[0].hidden = !this.fieldControlsVisibility()[name];
            }
        });
    }

    async enableTooltipsUI() {
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
        if (!pdf) return;

        const tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
        if (tooltipTexts.length > 0) {
            return;
        }

        const elements = iframe.contentWindow.document.getElementsByClassName('textWidgetAnnotation');
        const elementsMap = new Map()
        for (let e = 0; e < elements.length; e++) {
            const element = elements[e];
            const name = (element.firstChild as HTMLFormElement).name;
            elementsMap.set(name, element);
        }

        const annotations = await pdf.getFieldObjects();
        for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const pageAnnotations = await page.getAnnotations();

            for (let a = 0; a < pageAnnotations.length; a++) {
                const name = pageAnnotations[a].fieldName;
                if (annotations[name] && elementsMap.get(name)) {
                    const element = elementsMap.get(name);
                    element.classList.add("tooltip");
                    const x = iframe.contentWindow.document.createElement("SPAN");
                    x.classList.add("tooltiptext");
                    const tooltipText = pageAnnotations[a].alternativeText ? pageAnnotations[a].alternativeText : pageAnnotations[a].fieldName;
                    const t = iframe.contentWindow.document.createTextNode(tooltipText);
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

        const tooltipTexts = iframe.contentWindow.document.getElementsByClassName('tooltiptext');
        while (tooltipTexts.length > 0) {
            tooltipTexts[0].remove();
        }

        const annotations = iframe.contentWindow.document.getElementsByClassName('tooltip');
        while (annotations.length > 0) {
            annotations[0].classList.remove('tooltip');
        }

    }

    async fillOutFormFields() {
        if (!this.fieldValues()) return;
        const iframe = this.getIframe();
        if (!iframe) return;
        const pdf = this.getPDFDocument()
        if (!pdf) return;

        const annotationStorage = pdf.annotationStorage;
        const fieldObjects = await pdf.getFieldObjects();

        if (!fieldObjects) return;
        const fields: { [key: string]: any } = {};
        Object.keys(fieldObjects).forEach((name) => {
            const fieldObject = fieldObjects[name];
            fields[name] = fieldObject[0].id;
        });

        Object.keys(this.fieldValues()).forEach((key) => {
            if (fields[key]) {
                const element = iframe.contentWindow.document.getElementsByName(key)[0];
                if (element) {
                    if (fieldObjects[key][0].type == 'text')
                        (element as HTMLInputElement).value = this.fieldValues()[key];
                    else if (fieldObjects[key][0].type == 'checkbox')
                        (element as HTMLInputElement).checked = this.fieldValues()[key];
                    else {
                        console.warn('Cannot fill out form field: Only text and checkbox input types are currently implemented.');
                        return;
                    }
                }
                annotationStorage.setValue(fields[key], { value: this.fieldValues()[key] });
            }
        });
    }

    public async getFieldValues() {
        const pdf = this.getPDFDocument();
        const annotationStorage = pdf.annotationStorage;
        const fieldValues: { [key: string]: any } = {};

        const annotations = await pdf.getFieldObjects();
        Object.keys(annotations).forEach((key) => {
            const annotation = annotations[key][0];
            if (annotation.name) {
                const id = annotation.id
                let value = null
                if (annotationStorage.getRawValue(id)) {
                    value = annotationStorage.getRawValue(id).value;
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
        const annotations = await pdf.getFieldObjects();
        Object.keys(annotations).forEach((key) => {
            const annotation = annotations[key][0];
            if (annotation.name) {
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

        const toolbarViewer = iframe.contentWindow.document.getElementById('toolbarViewer');
        if (!toolbarViewer)
            return null;
        const toolbarSections = toolbarViewer.children;
        let controls: any[] = [];
        for (let i = 0; i < toolbarSections.length; i++) {
            controls = controls.concat(Array.from(toolbarSections[i].children));
        }
        const ids: string[] = [];
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
