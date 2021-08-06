import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServoyPublicModule } from '@servoy/public';
import { SvyPdfJsViewer } from './svypdfJsViewer';
import { SvyPDFViewer } from './svypdfviewer';
 
@NgModule({
    declarations: [
        SvyPDFViewer,
        SvyPdfJsViewer
    ],
    providers: [],
    imports: [
        CommonModule,
        ServoyPublicModule
    ],
    exports: [ 
        SvyPDFViewer,
        SvyPdfJsViewer
    ]
})
export class PdfViewerModule {}