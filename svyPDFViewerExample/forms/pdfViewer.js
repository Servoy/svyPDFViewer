/**
 * This is the document URL to load
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FAAAC345-AD6E-4068-8F2F-D4653BCCE0AB"}
 */
var documentURL = 'http://www.cbu.edu.zm/downloads/pdf-sample.pdf';


/**
 * When the document URL changes, (re)load the document
 *
 * @param {String} oldValue old value
 * @param {String} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FAAFF2F3-46FE-4FD6-9C4B-55EF13903824"}
 */
function onDataChange(oldValue, newValue, event) {
	elements.pdfViewer.documentURL = documentURL;
	return true
}

/**
 * Reloads the document. 
 * This may be needed when the document has changed on the back-end, but is still cached in the viewer.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"F7E79E64-D024-433B-A32A-1934DE5CB699"}
 */
function reload(event) {
	elements.pdfViewer.reload();
}
