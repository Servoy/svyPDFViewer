import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { SafePipe } from './safePipe';

// Unit test for the SafePipe in isolation. The pipe simply delegates to
// DomSanitizer.bypassSecurityTrustResourceUrl, so we provide a real
// DomSanitizer via TestBed and assert the pipe returns the sanitizer
// bypassed (trusted) value for a given URL.
describe('SafePipe', () => {
    let pipe: SafePipe;
    let sanitizer: DomSanitizer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SafePipe]
        });
        pipe = TestBed.inject(SafePipe);
        sanitizer = TestBed.inject(DomSanitizer);
    });

    it('should create the pipe', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return a defined SafeResourceUrl for a given url', () => {
        const result = pipe.transform('https://example.com/doc.pdf');
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
    });

    it('should delegate to DomSanitizer.bypassSecurityTrustResourceUrl', () => {
        const url = 'https://example.com/doc.pdf';
        const expected = sanitizer.bypassSecurityTrustResourceUrl(url);
        expect(pipe.transform(url)).toEqual(expected);
    });
});
