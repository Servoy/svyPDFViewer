import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServoyApiTesting, ServoyPublicTestingModule, WindowRefService } from '@servoy/public';
import { SvyPDFViewer } from './svypdfviewer';

// ---------------------------------------------------------------------------
// SvyPDFViewer renders a real PDF inside an <iframe>. We never load a real PDF.
// Instead we drive the component's glue logic directly:
//  - WindowRefService is faked so that nativeWindow.location.href is a
//    controllable string, which lets us assert how createBaseURL() splits on
//    '/solution/'. We install the fake both as a TestBed provider (so inject()
//    picks it up) and keep a reference to mutate the href per-test.
//  - iframeElementRef is a plain fake object (nativeElement with src and a
//    contentWindow.focus spy) because @ViewChild is not resolved without a real
//    template render against a real PDF.
//  - getRenderer() is stubbed with vi.spyOn so setAttribute is observable.
//  - setTimeout-based methods (reload, onTabSequenceRequest) are driven with
//    vi.useFakeTimers()/vi.runAllTimers() and real timers are restored after.
// ---------------------------------------------------------------------------

// A fake window whose location.href we can rewrite between tests.
const fakeWindow: any = {
    location: { href: 'http://host/app/solution/foo/index.html' }
};

class FakeWindowRefService {
    get nativeWindow(): any {
        return fakeWindow;
    }
}

describe('SvyPDFViewer', () => {
    let fixture: ComponentFixture<SvyPDFViewer>;
    let component: SvyPDFViewer;

    beforeEach(async () => {
        fakeWindow.location.href = 'http://host/app/solution/foo/index.html';

        await TestBed.configureTestingModule({
            imports: [ServoyPublicTestingModule, SvyPDFViewer],
            providers: [{ provide: WindowRefService, useClass: FakeWindowRefService }],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyPDFViewer);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('servoyApi', new ServoyApiTesting());
        // Make sure the injected windowRef is our fake even if provider ordering differs.
        (component as any).windowRef = new FakeWindowRefService();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // A reusable fake iframe element reference with a spy-able contentWindow.
    function fakeIframe(src = 'orig-src'): any {
        return {
            nativeElement: {
                src,
                contentWindow: { focus: vi.fn() }
            }
        };
    }

    // ------------------------------------------------------------- basics
    describe('basics', () => {
        it('creates the component', () => {
            expect(component).toBeTruthy();
        });

        it('initialises state fields', () => {
            expect(component.iframeURL()).toBe('');
            expect(component.noCacheVar).toBe('');
            expect(component.documentUrlVar).toBe('');
            expect(component.log).toBeTruthy();
        });
    });

    // ------------------------------------------------------- createBaseURL
    describe('createBaseURL', () => {
        it('builds a server URL from a dataProviderID with a .url (branch a)', () => {
            fixture.componentRef.setInput('dataProviderID', { url: 'media/doc.pdf' });
            const result = component.createBaseURL();

            expect(result).toBe(false);
            // split('/solution/')[0] of the fake href
            expect(component.documentUrlVar).toBe('http://host/app/' + encodeURI('media/doc.pdf'));
            expect(component.iframeURL()).toBe('http://host/app/' + encodeURI('media/doc.pdf') + '#');
        });

        it('uses a string dataProviderID directly (branch b)', () => {
            fixture.componentRef.setInput('dataProviderID', 'http://direct/url.pdf');
            component.createBaseURL();

            expect(component.documentUrlVar).toBe('http://direct/url.pdf');
            expect(component.iframeURL()).toBe('http://direct/url.pdf#');
        });

        it('falls back to documentURL when no dataProviderID (branch c)', () => {
            fixture.componentRef.setInput('documentURL', 'http://fallback/doc.pdf');
            component.createBaseURL();

            expect(component.documentUrlVar).toBe('http://fallback/doc.pdf');
            expect(component.iframeURL()).toBe('http://fallback/doc.pdf#');
        });

        it('returns false and does not update the iframe when nothing is set (branch d)', () => {
            const result = component.createBaseURL();

            expect(result).toBe(false);
            expect(component.documentUrlVar).toBe('');
            expect(component.iframeURL()).toBe('');
        });

        it('includes the noCache token in the final URL when present', () => {
            component.noCacheVar = 'r=12345';
            fixture.componentRef.setInput('documentURL', 'http://fallback/doc.pdf');
            component.createBaseURL();

            expect(component.iframeURL()).toBe('http://fallback/doc.pdf#r=12345');
        });
    });

    // ---------------------------------------------------------- setNoCheck
    describe('setNoCheck', () => {
        it('sets a random noCache token when noCache() is true', () => {
            fixture.componentRef.setInput('noCache', true);
            component.documentUrlVar = 'http://doc/x.pdf';
            component.setNoCheck();

            expect(component.noCacheVar).toMatch(/^r=\d+$/);
            expect(component.iframeURL()).toBe('http://doc/x.pdf#' + component.noCacheVar);
        });

        it('clears the noCache token when noCache() is not true', () => {
            fixture.componentRef.setInput('noCache', false);
            component.noCacheVar = 'r=999';
            component.documentUrlVar = 'http://doc/x.pdf';
            component.setNoCheck();

            expect(component.noCacheVar).toBe('');
            expect(component.iframeURL()).toBe('http://doc/x.pdf#');
        });
    });

    // ------------------------------------------------------ updateIframeURL
    describe('updateIframeURL', () => {
        it('returns early (no update) when the first value is falsy', () => {
            component.updateIframeURL(['', 'r=1']);
            expect(component.iframeURL()).toBe('');
        });

        it('joins remaining non-empty values with & after the # separator', () => {
            component.updateIframeURL(['http://doc/x.pdf', 'r=1', '', null, 'extra']);
            expect(component.iframeURL()).toBe('http://doc/x.pdf#r=1&extra');
        });

        it('produces a trailing # when there are no extra values', () => {
            component.updateIframeURL(['http://doc/x.pdf', '']);
            expect(component.iframeURL()).toBe('http://doc/x.pdf#');
        });
    });

    // ------------------------------------------------------------ ngOnChanges
    describe('ngOnChanges', () => {
        it('calls setNoCheck for the noCache change', () => {
            const spy = vi.spyOn(component, 'setNoCheck');
            component.ngOnChanges({ noCache: {} as any });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('calls createBaseURL for a documentURL change', () => {
            const spy = vi.spyOn(component, 'createBaseURL');
            component.ngOnChanges({ documentURL: {} as any });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('calls createBaseURL for a dataProviderID change', () => {
            const spy = vi.spyOn(component, 'createBaseURL');
            component.ngOnChanges({ dataProviderID: {} as any });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('handles multiple changes in one pass', () => {
            const noCheck = vi.spyOn(component, 'setNoCheck');
            const base = vi.spyOn(component, 'createBaseURL');
            component.ngOnChanges({ noCache: {} as any, documentURL: {} as any });
            expect(noCheck).toHaveBeenCalledTimes(1);
            expect(base).toHaveBeenCalledTimes(1);
        });

        it('ignores unrelated properties', () => {
            const noCheck = vi.spyOn(component, 'setNoCheck');
            const base = vi.spyOn(component, 'createBaseURL');
            component.ngOnChanges({ styleClass: {} as any });
            expect(noCheck).not.toHaveBeenCalled();
            expect(base).not.toHaveBeenCalled();
        });
    });

    // --------------------------------------------------------------- reload
    describe('reload', () => {
        it('blanks and then restores the iframe src across nested timers', () => {
            vi.useFakeTimers();
            const iframe = fakeIframe('http://doc/original.pdf');
            (component as any).iframeElementRef = iframe;
            const setAttribute = vi.fn();
            vi.spyOn(component as any, 'getRenderer').mockReturnValue({ setAttribute } as any);

            component.reload();
            vi.runAllTimers();

            expect(setAttribute).toHaveBeenCalledWith(iframe.nativeElement, 'src', 'about:blank');
            expect(setAttribute).toHaveBeenCalledWith(iframe.nativeElement, 'src', 'http://doc/original.pdf');
            expect(setAttribute).toHaveBeenCalledTimes(2);
        });
    });

    // --------------------------------------------------- onTabSequenceRequest
    describe('onTabSequenceRequest', () => {
        it('focuses the iframe content window after the timer fires', () => {
            vi.useFakeTimers();
            const iframe = fakeIframe();
            (component as any).iframeElementRef = iframe;

            component.onTabSequenceRequest();
            vi.runAllTimers();

            expect(iframe.nativeElement.contentWindow.focus).toHaveBeenCalledTimes(1);
        });
    });
});
