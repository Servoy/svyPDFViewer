import { LoggerFactory, LoggerService, ServoyBaseComponent, WindowRefService } from '@servoy/public';
import { Component, SimpleChanges, ViewChild, ChangeDetectionStrategy, ElementRef, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServoyPublicModule } from '@servoy/public';
import { SafePipe } from './safePipe';

@Component({
    selector: 'pdfviewer-pdf-Viewer',
    template: `
        <div [ngClass]="styleClass()" style="width:100%; height:100%" [id]="servoyApi().getMarkupId()" [sabloTabseq]="tabSeq()" (focus)="onTabSequenceRequest()" #element>
                <iframe #iframe [src]="iframeURL | safe" style="width:100%; height:100%" ></iframe>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ServoyPublicModule, SafePipe]
})
export class SvyPDFViewer extends ServoyBaseComponent<HTMLDivElement> {

    @ViewChild('iframe', { read: ElementRef }) iframeElementRef!: ElementRef;

    readonly documentURL = input<string>(undefined as any);
    readonly noCache = input<boolean>(undefined as any);
    readonly dataProviderID = input<any>(undefined as any);
    readonly tabSeq = input<number>(undefined as any);
    readonly styleClass = input<string>(undefined as any);
    readonly visible = input<boolean>(undefined as any);

    private readonly windowRef = inject(WindowRefService);
    private readonly logFactory = inject(LoggerFactory);

    log: LoggerService;
    noCacheVar = '';
    documentUrlVar = '';
    iframeURL = '';

    constructor() {
        super();
        this.log = this.logFactory.getLogger('SvyPDFViewer');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const property of Object.keys(changes)) {
                switch (property) {
                    case 'noCache':
                        this.setNoCheck();
                        break;
                    case 'documentURL':
                        this.createBaseURL();
                        break;
                    case 'dataProviderID':
                        this.createBaseURL();
                        break;
                }
            }
        }
    }

    createBaseURL() {
        this.documentUrlVar = '';
        if (this.dataProviderID() && this.dataProviderID().url) {
            const serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
            this.documentUrlVar += serverURL + '/' + encodeURI(this.dataProviderID().url);
        } else if (typeof this.dataProviderID() === 'string') {
            this.documentUrlVar += this.dataProviderID();
        } else if (this.documentURL()) {
            this.documentUrlVar += this.documentURL();
        } else {
            return false;
        }
        this.updateIframeURL([this.documentUrlVar, this.noCacheVar]);
        return false;
    }

    setNoCheck() {
        if (this.noCache() === true) {
            const r = Math.round(Math.random() * 10000000);
            this.noCacheVar = 'r=' + r;
        } else {
            this.noCacheVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.noCacheVar]);
    }

    updateIframeURL(newValues: any[]) {
        if(!newValues[0]) {
            return;
        }
        const url = newValues.shift();
        newValues = newValues.filter((item) => (item != null && item !== ''));
        this.iframeURL = url + '#' + newValues.join('&');
        this.log.debug('Rendering iframe pdf with URL: ' + this.iframeURL);
    }

    reload() {
        setTimeout(() => {
            const url = this.iframeElementRef.nativeElement.src;
            this.getRenderer().setAttribute(this.iframeElementRef.nativeElement, 'src', 'about:blank');
            setTimeout(() => {
                this.getRenderer().setAttribute(this.iframeElementRef.nativeElement, 'src', url);
            }, 5);
        });
    }

    onTabSequenceRequest() {
        setTimeout(() => {
            this.iframeElementRef.nativeElement.contentWindow.focus();
        });
    }
}
