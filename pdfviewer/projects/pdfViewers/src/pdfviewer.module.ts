import { NgModule } from '@angular/core';
import { SafePipe } from './safePipe';
import { SafeURLPipe } from './safeURLPipe';
import { SvyPdfJsViewer } from './svypdfJsViewer';
import { SvyPDFViewer } from './svypdfviewer';

@NgModule({
    imports: [
        SvyPDFViewer,
        SvyPdfJsViewer,
        SafePipe,
        SafeURLPipe
    ],
    exports: [
        SvyPDFViewer,
        SvyPdfJsViewer
    ]
})
export class PdfViewerModule {}
