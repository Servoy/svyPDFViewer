import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';

@Pipe({
    name: 'safe',
    standalone: true
})
export class SafePipe implements PipeTransform {

    private readonly sanitizer = inject(DomSanitizer);

    transform(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
