/**
 * pdfJsViewer provides more control and customization options than pdfViewer.
 * It is more flexible and can handle advanced features like drawing and digital signatures.
 * If customization is not required, consider using pdfViewer.
 **/

/**
 * URL of the document to be displayed.
 */
var documentURL;

/**
 * Bound data provider identifier for the PDF document.
 * The dataProviderID can also be a string, containing the URL of the PDF document.
 * By using the string, the saving of the PDF document will show the document name.
 * For example:
 * dataProviderID = '/' + "https://example.com/path/to/document.pdf"; or '/' + plugins.file.createFile(path to your local pdf).getRemoteUrl();
 */
var dataProviderID;

/**
 * Media or style sheet applied to the PDF viewer.
 */
var styleSheet;

/**
 * CSS style classes applied to the PDF viewer component.
 */
var styleClass;

/**
 * When true, prevents caching of the PDF document.
 */
var noCache;

/**
 * Flag indicating whether the PDF viewer is visible.
 */
var visible;

/**
 * Dimensions (width and height) of the PDF viewer component.
 */
var size;

/**
 * The current page number displayed in the viewer.
 */
var pageNumber;

/**
 * Tab sequence order for keyboard navigation.
 */
var tabSeq;

/**
 * The zoom level for displaying the PDF document.
 */
var zoomLevel;

/**
 * Flag indicating whether the toolbar is displayed.
 */
var showToolbar;

/**
 * Flag indicating whether tooltips are enabled in the PDF viewer.
 */
var enableTooltips;

var handlers = {
    /**
     * Fired when the page in the PDF viewer changes.
     *
     * @param {Number} pageNumber The page number of the new page that is displayed.
     * @param {Number} previousPageNumber The page number of the page that was previously displayed.
     */
    onPageChanged: function() {}
};


/**
 *  forces a reload of the current url
 **/
function reload () {
}

/**
 * Returns a map containing the field values.
 * 
 * @return {Map} A map of field values.
 **/
function getFieldValues() {
}

/**
 * Sets the field values.
 *
 * @param {Map} values - A map containing the field values to be set.
 **/
function setFieldValues(values) {
}

/**
 * Returns an array of strings representing the field names.
 * 
 * @return {Array<String>} An array of field names.
 **/
function getFieldNames() {
}

/**
 * Returns an array of strings representing the toolbar control IDs.
 * 
 * This should not be used at runtime because it can only be called when the view is visible.
 * It is intended for developers to get the names that the current pdfjs viewer internal component supports, 
 * which can then be used in the solution.
 * 
 * @return {Array<String>} An array of toolbar control IDs.
 **/
function getToolbarControlIds() {
}

/**
 * Sets the visibility of the toolbar controls.
 *
 * @param {Array<String>} ids - An array of toolbar control IDs.
 * @param {Boolean} visible - A boolean indicating the visibility of the toolbar controls.
 **/
function setToolbarControlsVisibility(ids, visible) {
}

/**
 * Sets the visibility of the field controls.
 *
 * @param {Array<String>} names - An array of field control names.
 * @param {Boolean} visible - A boolean indicating the visibility of the field controls.
 **/
function setFieldControlsVisibility(names, visible) {
}