import { Pipe, PipeTransform, SecurityContext} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeURL',
    standalone: false
})

export class SafeURLPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(url: string) {
        return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
}
