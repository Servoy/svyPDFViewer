/**
 * pdfViewer uses the PDF viewing capabilities built into the browser.
 * It is simple and relies on tools already available in the client's browser, offering limited personalization.
 * For more customization options, consider using pdfJsViewer.
 */

/**
 * URL of the document to be displayed.
 */
var documentURL;

/**
 * Bound data provider identifier for the PDF document.
 */
var dataProviderID;

/**
 * CSS style classes applied to the pdfViewer component.
 */
var styleClass;

/**
 * When true, prevents caching of the PDF document.
 */
var noCache;

/**
 * Flag indicating whether the pdfViewer is visible.
 */
var visible;

/**
 * Dimensions (width and height) of the pdfViewer component.
 */
var size;

/**
 * Tab sequence order for keyboard navigation.
 */
var tabSeq;


/**
 *  forces a reload of the current url
 **/
function reload () {
}