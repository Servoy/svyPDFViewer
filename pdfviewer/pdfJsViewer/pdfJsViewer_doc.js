/**
 * pdfJsViewer provides more control and customization options than pdfViewer.
 * It is more flexible and can handle advanced features like drawing and digital signatures.
 * If customization is not required, consider using pdfViewer.
 **/

var documentURL;

var dataProviderID;

var styleSheet;

var styleClass;

var noCache;

var visible;

var size;

var pageNumber;

var tabSeq;

var zoomLevel;

var showToolbar;

var enableTooltips;


var handlers = {
    /**
     * @param {Number} pageNumber
     * @param {Number} previousPageNumber
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