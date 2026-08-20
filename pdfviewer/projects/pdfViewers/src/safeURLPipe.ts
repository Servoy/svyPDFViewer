import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeURL',
    standalone: true
})
export class SafeURLPipe implements PipeTransform {

    private readonly sanitizer = inject(DomSanitizer);

    transform(url: string) {
        return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
}
