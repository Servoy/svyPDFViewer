import { ServoyBaseComponent, WindowRefService } from '@servoy/public';
import { Component, Input, Renderer2, ChangeDetectorRef, ElementRef, SimpleChanges, ViewChild, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'pdfviewer-pdf-Js-Viewer',
    template: `
        <div [ngClass]="styleClass" style="height: 100%; width: 100%" [id]="servoyApi.getMarkupId()" [sabloTabseq]="tabSeq" (focus)="onTabSequenceRequest()">
            <iframe #iframe *ngIf="visible" [src]="iframeURL" style="width:100%; height:100%"></iframe>
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

    noCacheVar = "";
    documentUrlVar = "";
    zoomLevelVar = ""
    pageNumberVar = "";
    iframeURL: SafeResourceUrl = "";

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, 
        private windowRef: WindowRefService, 
        private sanitizer: DomSanitizer,
        @Inject(DOCUMENT) private doc: Document) {
        super(renderer, cdRef);
    }

    svyOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const property of Object.keys(changes)) {
                switch (property) {
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
                    case 'visible': 
                        this.addCustomCSS();
                        break; 
                }
            }
        }
    }

    createBaseURL() {
        this.documentURL = "pdfviewer/pdfJsViewer/web/viewer.html";
        if (this.dataProviderID && this.dataProviderID.url) {
            let serverURL = this.windowRef.nativeWindow.location.href.split('/solutions/')[0];
            this.documentUrlVar += "?file=" + serverURL + '/' + encodeURI(this.dataProviderID.url); 
        } else if (this.documentURL) {
            // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
            this.documentUrlVar += "?file=" + this.documentURL;
        } else {
            return false;
        }     
        this.updateIframeURL([this.documentUrlVar, this.pageNumberVar, this.zoomLevelVar, this.noCacheVar]);
        return false;
    }

    setNoCache() {
        // check for noCache and generate random http param
        if (this.noCache === true) {
            var r = Math.round(Math.random() * 10000000);
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
                this.renderer.listen(this.iframeElementRef.nativeElement, 'load', () => {
                    let link = document.createElement('link');
                    link.href = this.windowRef.nativeWindow.location.origin + '/' + this.styleSheet;
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    // frames[0].document.head.appendChild(link);
                });
                this.iframeElementRef.nativeElement
            });
        }
    }
    
    /**
     * The first parameter of the newValues array should be 'documentURL'
     * @param newValues 
     */
    updateIframeURL(newValues: any[]) {
        if(!newValues[0]) {
            return;
        }
        const url = newValues.shift();
        newValues = newValues.filter((item) => { return (item != null && item != '')});
        this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#' + newValues.join('&'));
        console.debug('Rendering iframe pdf with URL: ' + this.iframeURL);
    }

    reload() {
        setTimeout(() => {
            const url = this.iframeElementRef.nativeElement.src;
            this.renderer.setAttribute(this.iframeElementRef, 'src', 'about:blank');
            setTimeout(() => {
                this.renderer.setAttribute(this.iframeElementRef, 'src', url);
            }, 5);
        });
    }

    onTabSequenceRequest() {
        setTimeout(() => {
            this.iframeElementRef.nativeElement.contentWindow.focus();
        });
    }
}