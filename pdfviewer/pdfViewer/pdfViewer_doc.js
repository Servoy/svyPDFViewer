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
 * The dataProviderID can now also be a string, containing the URL of the PDF document.
 * By using the dataProviderID as a string, the saving of the PDF document will show the document name.
 * For example:
 * dataProviderID = "https://example.com/path/to/document.pdf"; or plugins.file.createFile(path to your local pdf).getRemoteUrl();
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