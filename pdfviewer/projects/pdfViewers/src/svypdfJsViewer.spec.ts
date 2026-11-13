import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServoyApiTesting, ServoyPublicTestingModule, WindowRefService } from '@servoy/public';
import { SvyPdfJsViewer } from './svypdfJsViewer';

// ---------------------------------------------------------------------------
// SvyPdfJsViewer wraps pdf.js running inside an <iframe>. We never load the
// real pdf.js viewer. Instead we drive the component's glue logic directly by
// feeding it a fully faked iframe whose contentWindow exposes a fake
// PDFViewerApplication, a fake document, and an eventBus. Dependencies are
// stubbed the same way as in svypdfviewer.spec.ts:
//  - WindowRefService faked so location.href is controllable (createBaseURL,
//    addCustomCSS use split('/solution/')).
//  - iframeElementRef / getIframe() replaced with a fake nativeElement.
//  - getRenderer() stubbed via vi.spyOn so setAttribute/listen are observable.
//  - setTimeout-based methods driven with fake timers; real timers restored.
// ---------------------------------------------------------------------------

const fakeWindow: any = {
    location: { href: 'http://host/app/solution/foo/index.html' }
};

class FakeWindowRefService {
    get nativeWindow(): any {
        return fakeWindow;
    }
}

// Build a fake iframe DOM + pdf.js application.
function makeFakeViewer(overrides: Record<string, any> = {}): any {
    const listeners: Record<string, Function[]> = {};
    const eventBus = {
        on: vi.fn((event: string, cb: Function) => {
            (listeners[event] = listeners[event] || []).push(cb);
        }),
        __emit(event: string, ...args: any[]) {
            (listeners[event] || []).forEach((cb) => cb(...args));
        }
    };
    const viewer: any = {
        initializedPromise: Promise.resolve(),
        eventBus,
        pdfDocument: null,
        __listeners: listeners
    };
    return Object.assign(viewer, overrides);
}

function makeFakeDoc(): any {
    const elementsById: Record<string, any> = {};
    return {
        __byId: elementsById,
        getElementById: vi.fn((id: string) => elementsById[id] || null),
        getElementsByName: vi.fn(() => [] as any[]),
        getElementsByClassName: vi.fn(() => [] as any[]),
        createElement: vi.fn((tag: string) => document.createElement(tag)),
        createTextNode: vi.fn((t: string) => document.createTextNode(t)),
        head: document.createElement('head')
    };
}

describe('SvyPdfJsViewer', () => {
    let fixture: ComponentFixture<SvyPdfJsViewer>;
    let component: SvyPdfJsViewer;

    beforeEach(async () => {
        fakeWindow.location.href = 'http://host/app/solution/foo/index.html';

        await TestBed.configureTestingModule({
            imports: [ServoyPublicTestingModule, SvyPdfJsViewer],
            providers: [{ provide: WindowRefService, useClass: FakeWindowRefService }],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyPdfJsViewer);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('servoyApi', new ServoyApiTesting());
        (component as any).windowRef = new FakeWindowRefService();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // Build a fake iframe element reference and attach it to the component.
    function installFakeIframe(opts: {
        viewer?: any;
        doc?: any;
        src?: string;
    } = {}): any {
        const doc = opts.doc ?? makeFakeDoc();
        const contentWindow: any = {
            document: doc,
            focus: vi.fn(),
            PDFViewerApplication: opts.viewer
        };
        const nativeElement: any = {
            src: opts.src ?? 'http://doc/original.pdf',
            contentWindow,
            contentDocument: { head: document.createElement('head') },
            setAttribute: vi.fn(),
            removeAttribute: vi.fn()
        };
        const ref = { nativeElement };
        (component as any).iframeElementRef = ref;
        return ref;
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
            expect(component.zoomLevelVar).toBe('');
            expect(component.pageNumberVar).toBe('');
            expect(component.log).toBeTruthy();
        });

        it('getIframe returns the native element', () => {
            const ref = installFakeIframe();
            expect(component.getIframe()).toBe(ref.nativeElement);
        });
    });

    // --------------------------------------------------------- ngAfterViewInit
    describe('ngAfterViewInit', () => {
        it('sets the designer viewer src when in designer', () => {
            vi.spyOn(component.servoyApi(), 'isInDesigner').mockReturnValue(true);
            // Avoid the base-class ngAfterViewInit (needs a rendered #element); only
            // exercise this component's override body.
            vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(component)), 'ngAfterViewInit').mockImplementation(() => undefined);
            const ref = installFakeIframe();
            vi.useFakeTimers();

            component.ngAfterViewInit();
            vi.runAllTimers();

            expect(ref.nativeElement.setAttribute).toHaveBeenCalledWith('src', 'pdfjs/web/viewer.html');
            expect(ref.nativeElement.removeAttribute).toHaveBeenCalledWith('hidden');
        });

        it('does nothing extra when not in designer', () => {
            vi.spyOn(component.servoyApi(), 'isInDesigner').mockReturnValue(false);
            vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(component)), 'ngAfterViewInit').mockImplementation(() => undefined);
            vi.useFakeTimers();
            const ref = installFakeIframe();
            component.ngAfterViewInit();
            vi.runAllTimers();
            expect(ref.nativeElement.setAttribute).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------- createBaseURL
    describe('createBaseURL', () => {
        it('builds a file URL from a dataProviderID with a .url (branch a)', () => {
            fixture.componentRef.setInput('dataProviderID', { url: 'media/doc.pdf' });
            const result = component.createBaseURL();

            expect(result).toBe(false);
            expect(component.documentUrlVar).toBe('pdfjs/web/viewer.html?file=http://host/app/' + encodeURIComponent('media/doc.pdf'));
            expect(component.iframeURL()).toBe(component.documentUrlVar + '#');
        });

        it('uses a string dataProviderID directly (branch b)', () => {
            fixture.componentRef.setInput('dataProviderID', 'http://direct/url.pdf');
            component.createBaseURL();

            expect(component.documentUrlVar).toBe('pdfjs/web/viewer.html?file=http://direct/url.pdf');
            expect(component.iframeURL()).toBe('pdfjs/web/viewer.html?file=http://direct/url.pdf#');
        });

        it('falls back to documentURL (branch c)', () => {
            fixture.componentRef.setInput('documentURL', 'http://fallback/doc.pdf');
            component.createBaseURL();

            expect(component.documentUrlVar).toBe('pdfjs/web/viewer.html?file=http://fallback/doc.pdf');
            expect(component.iframeURL()).toBe('pdfjs/web/viewer.html?file=http://fallback/doc.pdf#');
        });

        it('sets a bare viewer URL when nothing is provided (branch d)', () => {
            const result = component.createBaseURL();
            expect(result).toBe(false);
            expect(component.iframeURL()).toBe('pdfjs/web/viewer.html');
        });

        it('includes page, zoom and noCache tokens', () => {
            component.pageNumberVar = 'page=2';
            component.zoomLevelVar = 'zoom=150';
            component.noCacheVar = 'r=5';
            fixture.componentRef.setInput('documentURL', 'http://fallback/doc.pdf');
            component.createBaseURL();

            expect(component.iframeURL()).toBe('pdfjs/web/viewer.html?file=http://fallback/doc.pdf#page=2&zoom=150&r=5');
        });
    });

    // ------------------------------------------------------------ setNoCache
    describe('setNoCache', () => {
        it('sets a random token when noCache() is true', () => {
            fixture.componentRef.setInput('noCache', true);
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setNoCache();
            expect(component.noCacheVar).toMatch(/^r=\d+$/);
            expect(component.iframeURL()).toContain(component.noCacheVar);
        });

        it('clears the token when noCache() is not true', () => {
            fixture.componentRef.setInput('noCache', false);
            component.noCacheVar = 'r=9';
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setNoCache();
            expect(component.noCacheVar).toBe('');
        });
    });

    // ----------------------------------------------------------- setZoomLevel
    describe('setZoomLevel', () => {
        it('sets a zoom token when zoomLevel() is not null', () => {
            fixture.componentRef.setInput('zoomLevel', '150');
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setZoomLevel();
            expect(component.zoomLevelVar).toBe('zoom=150');
            expect(component.iframeURL()).toContain('zoom=150');
        });

        it('clears the zoom token when zoomLevel() is null', () => {
            component.zoomLevelVar = 'zoom=99';
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setZoomLevel();
            expect(component.zoomLevelVar).toBe('');
        });
    });

    // ---------------------------------------------------------- setPageNumber
    describe('setPageNumber', () => {
        it('sets a page token when pageNumber() >= 1', () => {
            fixture.componentRef.setInput('pageNumber', 3);
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setPageNumber();
            expect(component.pageNumberVar).toBe('page=3');
            expect(component.iframeURL()).toContain('page=3');
        });

        it('leaves the page token unchanged for null/invalid pageNumber()', () => {
            component.pageNumberVar = '';
            component.documentUrlVar = 'pdfjs/web/viewer.html?file=x';
            component.setPageNumber();
            expect(component.pageNumberVar).toBe('');
        });
    });

    // ------------------------------------------------------ updateIframeURL
    describe('updateIframeURL', () => {
        it('returns early when the first value is falsy', () => {
            component.updateIframeURL(['', 'r=1']);
            expect(component.iframeURL()).toBe('');
        });

        it('joins remaining non-empty values with &', () => {
            component.updateIframeURL(['base', 'page=1', '', null, 'r=2']);
            expect(component.iframeURL()).toBe('base#page=1&r=2');
        });
    });

    // ------------------------------------------------------------- addCustomCSS
    describe('addCustomCSS', () => {
        it('does nothing when there is no styleSheet', () => {
            vi.useFakeTimers();
            const listen = vi.fn();
            vi.spyOn(component as any, 'getRenderer').mockReturnValue({ listen } as any);
            component.addCustomCSS();
            vi.runAllTimers();
            expect(listen).not.toHaveBeenCalled();
        });

        it('registers a load listener that appends a <link> to the iframe head', () => {
            vi.useFakeTimers();
            fixture.componentRef.setInput('styleSheet', 'css/custom.css');
            const ref = installFakeIframe();

            // getRenderer().listen captures the callback; invoke it to run the body.
            let loadCb: Function = () => undefined;
            const listen = vi.fn((_el: any, _evt: string, cb: Function) => { loadCb = cb; });
            vi.spyOn(component as any, 'getRenderer').mockReturnValue({ listen } as any);

            component.addCustomCSS();
            vi.runAllTimers();
            expect(listen).toHaveBeenCalledTimes(1);

            // drive the load callback and check a stylesheet link is added
            const head = ref.nativeElement.contentDocument.head;
            loadCb();
            const link = head.querySelector('link');
            expect(link).toBeTruthy();
            expect(link!.getAttribute('rel')).toBe('stylesheet');
            expect(link!.getAttribute('href')).toBe('http://host/app/css/custom.css');
        });
    });

    // --------------------------------------------------------------- reload
    describe('reload', () => {
        it('blanks and restores the iframe src across nested timers', () => {
            vi.useFakeTimers();
            const ref = installFakeIframe({ src: 'http://doc/original.pdf' });
            const setAttribute = vi.fn();
            vi.spyOn(component as any, 'getRenderer').mockReturnValue({ setAttribute } as any);

            component.reload();
            vi.runAllTimers();

            expect(setAttribute).toHaveBeenCalledWith(ref.nativeElement, 'src', 'about:blank');
            expect(setAttribute).toHaveBeenCalledWith(ref.nativeElement, 'src', 'http://doc/original.pdf');
        });
    });

    // --------------------------------------------------- onTabSequenceRequest
    describe('onTabSequenceRequest', () => {
        it('focuses the iframe content window after the timer fires', () => {
            vi.useFakeTimers();
            const ref = installFakeIframe();
            component.onTabSequenceRequest();
            vi.runAllTimers();
            expect(ref.nativeElement.contentWindow.focus).toHaveBeenCalledTimes(1);
        });
    });

    // ---------------------------------------------------- onShowToolbarChanged
    describe('onShowToolbarChanged', () => {
        it('does nothing when there is no iframe', () => {
            expect(() => component.onShowToolbarChanged()).not.toThrow();
        });

        it('shows the toolbar when showToolbar() is true', () => {
            fixture.componentRef.setInput('showToolbar', true);
            const doc = makeFakeDoc();
            const toolbar: any = { style: { display: 'none' } };
            doc.__byId['toolbarContainer'] = toolbar;
            installFakeIframe({ doc });

            component.onShowToolbarChanged();
            expect(toolbar.style.display).toBe('block');
        });

        it('hides the toolbar when showToolbar() is false', () => {
            fixture.componentRef.setInput('showToolbar', false);
            const doc = makeFakeDoc();
            const toolbar: any = { style: { display: 'block' } };
            doc.__byId['toolbarContainer'] = toolbar;
            installFakeIframe({ doc });

            component.onShowToolbarChanged();
            expect(toolbar.style.display).toBe('none');
        });
    });

    // ---------------------------------------------------- hideToolbarControls
    describe('hideToolbarControls', () => {
        it('returns early when there is no visibility map', () => {
            installFakeIframe();
            expect(() => component.hideToolbarControls()).not.toThrow();
        });

        it('returns early when there is no iframe', () => {
            fixture.componentRef.setInput('toolbarControlsVisibility', { a: true });
            expect(() => component.hideToolbarControls()).not.toThrow();
        });

        it('toggles the hidden flag of matching elements', () => {
            fixture.componentRef.setInput('toolbarControlsVisibility', { btnA: false, btnB: true });
            const doc = makeFakeDoc();
            const a: any = { hidden: false };
            const b: any = { hidden: true };
            doc.__byId['btnA'] = a;
            doc.__byId['btnB'] = b;
            installFakeIframe({ doc });

            component.hideToolbarControls();
            expect(a.hidden).toBe(true);
            expect(b.hidden).toBe(false);
        });
    });

    // ------------------------------------------------------- hideFieldControls
    describe('hideFieldControls', () => {
        it('returns early when there is no visibility map', () => {
            installFakeIframe();
            expect(() => component.hideFieldControls()).not.toThrow();
        });

        it('toggles the hidden flag for a named element', () => {
            fixture.componentRef.setInput('fieldControlsVisibility', { field1: false });
            const doc = makeFakeDoc();
            const el: any = { hidden: false };
            doc.getElementsByName = vi.fn(() => [el]);
            installFakeIframe({ doc });

            component.hideFieldControls();
            expect(el.hidden).toBe(true);
        });
    });

    // --------------------------------------------------------- documentLoaded
    describe('documentLoaded', () => {
        it('does nothing when there is no PDFViewerApplication', () => {
            installFakeIframe({ viewer: undefined });
            expect(() => component.documentLoaded()).not.toThrow();
        });

        it('wires event bus listeners once the viewer is initialised', async () => {
            const viewer = makeFakeViewer();
            installFakeIframe({ viewer });

            component.documentLoaded();
            await viewer.initializedPromise;
            // let the then-callback run
            await Promise.resolve();

            expect(viewer.eventBus.on).toHaveBeenCalledWith('textlayerrendered', expect.any(Function));
            expect(viewer.eventBus.on).toHaveBeenCalledWith('annotationlayerrendered', expect.any(Function));
        });

        it('registers a pagechanging handler when onPageChanged is provided', async () => {
            const onPageChanged = vi.fn();
            fixture.componentRef.setInput('onPageChanged', onPageChanged);
            const viewer = makeFakeViewer();
            installFakeIframe({ viewer });

            component.documentLoaded();
            await viewer.initializedPromise;
            await Promise.resolve();

            expect(viewer.eventBus.on).toHaveBeenCalledWith('pagechanging', expect.any(Function));
            viewer.eventBus.__emit('pagechanging', { pageNumber: 2, previous: 1 });
            expect(onPageChanged).toHaveBeenCalledWith(2, 1);
        });
    });

    // ------------------------------------------------------- getPDFDocument
    describe('getPDFDocument', () => {
        it('returns null when there is no iframe', () => {
            expect(component.getPDFDocument()).toBeNull();
        });

        it('returns the pdf document from the viewer application', () => {
            const pdf = { numPages: 1 };
            const viewer = makeFakeViewer({ pdfDocument: pdf });
            installFakeIframe({ viewer });
            expect(component.getPDFDocument()).toBe(pdf);
        });
    });

    // ----------------------------------------------- disableTooltips / enable
    describe('tooltip handling', () => {
        it('disableTooltips returns early with no iframe', async () => {
            await expect(component.disableTooltips()).resolves.toBeUndefined();
        });

        it('disableTooltips returns early with no pdf document', async () => {
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: null }) });
            await expect(component.disableTooltips()).resolves.toBeUndefined();
        });

        it('disableTooltips removes tooltip nodes and classes', async () => {
            const tooltipTexts: any[] = [{ remove: vi.fn() }];
            const tooltips: any[] = [{ classList: { remove: vi.fn() } }];
            const doc = makeFakeDoc();
            doc.getElementsByClassName = vi.fn((cls: string) => {
                if (cls === 'tooltiptext') return tooltipTexts;
                if (cls === 'tooltip') return tooltips;
                return [];
            });
            const removeSpy = tooltipTexts[0].remove.mockImplementation(() => tooltipTexts.shift());
            const classRemove = tooltips[0].classList.remove.mockImplementation(() => tooltips.shift());
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: { numPages: 1 } }) });

            await component.disableTooltips();
            expect(removeSpy).toHaveBeenCalled();
            expect(classRemove).toHaveBeenCalled();
        });

        it('enableTooltipsUI returns early with no iframe', async () => {
            await expect(component.enableTooltipsUI()).resolves.toBeUndefined();
        });

        it('enableTooltipsUI returns early with no pdf document', async () => {
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: null }) });
            await expect(component.enableTooltipsUI()).resolves.toBeUndefined();
        });

        it('enableTooltipsUI returns early when tooltips already exist', async () => {
            const doc = makeFakeDoc();
            doc.getElementsByClassName = vi.fn((cls: string) => (cls === 'tooltiptext' ? [{}] : []));
            const pdf = { getFieldObjects: vi.fn(), numPages: 1 };
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: pdf }) });

            await component.enableTooltipsUI();
            expect(pdf.getFieldObjects).not.toHaveBeenCalled();
        });

        it('enableTooltipsUI adds tooltip spans for annotated fields', async () => {
            const doc = makeFakeDoc();
            const inner = document.createElement('input');
            (inner as any).name = 'f1';
            const widget = document.createElement('div');
            widget.appendChild(inner);

            doc.getElementsByClassName = vi.fn((cls: string) => {
                if (cls === 'tooltiptext') return [];
                if (cls === 'textWidgetAnnotation') return [widget];
                return [];
            });

            const page = { getAnnotations: vi.fn(() => Promise.resolve([{ fieldName: 'f1', alternativeText: 'Tip!' }])) };
            const pdf: any = {
                numPages: 1,
                getFieldObjects: vi.fn(() => Promise.resolve({ f1: {} })),
                getPage: vi.fn(() => Promise.resolve(page))
            };
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: pdf }) });

            await component.enableTooltipsUI();

            expect(widget.classList.contains('tooltip')).toBe(true);
            const span = widget.querySelector('.tooltiptext');
            expect(span).toBeTruthy();
            expect(span!.textContent).toBe('Tip!');
        });
    });

    // --------------------------------------------------------- fillOutFormFields
    describe('fillOutFormFields', () => {
        it('returns early when there are no field values', async () => {
            await expect(component.fillOutFormFields()).resolves.toBeUndefined();
        });

        it('returns early when there is no iframe', async () => {
            fixture.componentRef.setInput('fieldValues', { a: 'x' });
            await expect(component.fillOutFormFields()).resolves.toBeUndefined();
        });

        it('returns early when there is no pdf document', async () => {
            fixture.componentRef.setInput('fieldValues', { a: 'x' });
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: null }) });
            await expect(component.fillOutFormFields()).resolves.toBeUndefined();
        });

        it('sets values into annotation storage and matching DOM inputs', async () => {
            fixture.componentRef.setInput('fieldValues', { name: 'Alice', agree: true });

            const input = document.createElement('input');
            input.type = 'text';
            input.setAttribute('data-annotation-id', 'ann-1');
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.setAttribute('data-annotation-id', 'ann-2');

            const doc = makeFakeDoc();
            doc.getElementsByName = vi.fn((name: string) => {
                if (name === 'name') return [input];
                if (name === 'agree') return [check];
                return [];
            });

            const setValue = vi.fn();
            const pdf: any = {
                annotationStorage: { setValue },
                getFieldObjects: vi.fn(() => Promise.resolve({
                    name: [{ id: 'w1', type: 'text' }],
                    agree: [{ id: 'w2', type: 'checkbox' }]
                }))
            };
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: pdf }) });

            await component.fillOutFormFields();

            expect(input.value).toBe('Alice');
            expect(check.checked).toBe(true);
            expect(setValue).toHaveBeenCalledWith('w1', { value: 'Alice' });
            expect(setValue).toHaveBeenCalledWith('w2', { value: true });
            expect(setValue).toHaveBeenCalledWith('ann-1', { value: 'Alice' });
            expect(setValue).toHaveBeenCalledWith('ann-2', { value: true });
        });

        it('returns early when field objects are missing', async () => {
            fixture.componentRef.setInput('fieldValues', { a: 'x' });
            const pdf: any = {
                annotationStorage: { setValue: vi.fn() },
                getFieldObjects: vi.fn(() => Promise.resolve(null))
            };
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: pdf }) });
            await expect(component.fillOutFormFields()).resolves.toBeUndefined();
        });

        it('warns for a field with no widgets', async () => {
            fixture.componentRef.setInput('fieldValues', { missing: 'x' });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const pdf: any = {
                annotationStorage: { setValue: vi.fn() },
                getFieldObjects: vi.fn(() => Promise.resolve({ other: [{ id: 'w', type: 'text' }] }))
            };
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: pdf }) });
            await component.fillOutFormFields();
            // missing field has no widgets -> skipped (early return), no warn
            expect(warn).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------------ getFieldValues
    describe('getFieldValues', () => {
        it('reads values from annotation storage via DOM annotation ids', async () => {
            const input = document.createElement('input');
            input.setAttribute('data-annotation-id', 'ann-1');
            const doc = makeFakeDoc();
            doc.getElementsByName = vi.fn(() => [input]);

            const pdf: any = {
                annotationStorage: {
                    getRawValue: vi.fn((id: string) => (id === 'ann-1' ? { value: 'Bob' } : null))
                },
                getFieldObjects: vi.fn(() => Promise.resolve({ name: [{ id: 'w1', name: 'name', value: 'default' }] }))
            };
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: pdf }) });

            const result = await component.getFieldValues();
            expect(result).toEqual({ name: 'Bob' });
        });

        it('falls back to widget values when storage is empty', async () => {
            const doc = makeFakeDoc();
            doc.getElementsByName = vi.fn(() => []);
            const pdf: any = {
                annotationStorage: { getRawValue: vi.fn(() => null) },
                getFieldObjects: vi.fn(() => Promise.resolve({ name: [{ id: 'w1', name: 'name', value: 'DefVal' }] }))
            };
            installFakeIframe({ doc, viewer: makeFakeViewer({ pdfDocument: pdf }) });

            const result = await component.getFieldValues();
            expect(result).toEqual({ name: 'DefVal' });
        });
    });

    // ------------------------------------------------------------- getFieldNames
    describe('getFieldNames', () => {
        it('returns null when there is no pdf document', async () => {
            await expect(component.getFieldNames()).resolves.toBeNull();
        });

        it('returns the keys for annotations having a name', async () => {
            const pdf: any = {
                getFieldObjects: vi.fn(() => Promise.resolve({
                    first: [{ name: 'first' }],
                    second: [{ name: 'second' }],
                    nameless: [{}]
                }))
            };
            installFakeIframe({ viewer: makeFakeViewer({ pdfDocument: pdf }) });

            const result = await component.getFieldNames();
            expect(result).toEqual(['first', 'second']);
        });
    });

    // ------------------------------------------------------ getToolbarControlIds
    describe('getToolbarControlIds', () => {
        it('returns null when there is no iframe', () => {
            expect(component.getToolbarControlIds()).toBeNull();
        });

        it('returns null when there is no toolbarViewer', () => {
            const doc = makeFakeDoc();
            installFakeIframe({ doc });
            expect(component.getToolbarControlIds()).toBeNull();
        });

        it('collects ids from the toolbar sections', () => {
            const doc = makeFakeDoc();
            const c1: any = { id: 'ctrl1', children: [] };
            const c2: any = { id: '', children: [] };
            const section: any = { children: [c1, c2] };
            const toolbarViewer: any = { children: [section] };
            doc.__byId['toolbarViewer'] = toolbarViewer;
            installFakeIframe({ doc });

            const ids = component.getToolbarControlIds();
            expect(ids).toEqual(['ctrl1']);
        });
    });

    // ------------------------------------------------------------- ngOnChanges
    describe('ngOnChanges', () => {
        function change(current: any, previous: any = undefined) {
            return { currentValue: current, previousValue: previous } as any;
        }

        it('dispatches each property to its handler', () => {
            const setNoCache = vi.spyOn(component, 'setNoCache').mockImplementation(() => undefined);
            const createBaseURL = vi.spyOn(component, 'createBaseURL').mockReturnValue(false);
            const setZoomLevel = vi.spyOn(component, 'setZoomLevel').mockImplementation(() => undefined);
            const setPageNumber = vi.spyOn(component, 'setPageNumber').mockImplementation(() => undefined);
            const addCustomCSS = vi.spyOn(component, 'addCustomCSS').mockImplementation(() => undefined);
            const onShowToolbarChanged = vi.spyOn(component, 'onShowToolbarChanged').mockImplementation(() => undefined);
            const hideToolbarControls = vi.spyOn(component, 'hideToolbarControls').mockImplementation(() => undefined);
            const hideFieldControls = vi.spyOn(component, 'hideFieldControls').mockImplementation(() => undefined);
            const fillOutFormFields = vi.spyOn(component, 'fillOutFormFields').mockResolvedValue(undefined);

            component.ngOnChanges({
                noCache: change(true),
                documentURL: change('a'),
                dataProviderID: change('b'),
                zoomLevel: change('150'),
                pageNumber: change(2),
                styleSheet: change('x.css'),
                showToolbar: change(true),
                fieldValues: change({ a: 1 }),
                toolbarControlsVisibility: change({ a: true }),
                fieldControlsVisibility: change({ a: true })
            });

            expect(setNoCache).toHaveBeenCalled();
            expect(createBaseURL).toHaveBeenCalledTimes(2);
            expect(setZoomLevel).toHaveBeenCalled();
            expect(setPageNumber).toHaveBeenCalled();
            expect(addCustomCSS).toHaveBeenCalled();
            expect(onShowToolbarChanged).toHaveBeenCalled();
            expect(hideToolbarControls).toHaveBeenCalled();
            expect(hideFieldControls).toHaveBeenCalled();
            expect(fillOutFormFields).toHaveBeenCalled();
        });

        it('enables tooltips UI on an enableTooltips true change', () => {
            fixture.componentRef.setInput('enableTooltips', true);
            const enable = vi.spyOn(component, 'enableTooltipsUI').mockResolvedValue(undefined);
            component.ngOnChanges({ enableTooltips: change(true) });
            expect(enable).toHaveBeenCalled();
        });

        it('disables tooltips on an enableTooltips false change', () => {
            fixture.componentRef.setInput('enableTooltips', false);
            const disable = vi.spyOn(component, 'disableTooltips').mockResolvedValue(undefined);
            component.ngOnChanges({ enableTooltips: change(false) });
            expect(disable).toHaveBeenCalled();
        });

        it('skips handlers when current equals previous', () => {
            const setNoCache = vi.spyOn(component, 'setNoCache').mockImplementation(() => undefined);
            component.ngOnChanges({ noCache: change(true, true) });
            expect(setNoCache).not.toHaveBeenCalled();
        });
    });
});
