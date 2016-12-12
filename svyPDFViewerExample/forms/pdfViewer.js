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
function onDataChangeDocumentURL(oldValue, newValue, event) {
	loadDocument();
	return true
}

/**
 * (Re)Loads the document
 * @private 
 *
 * @properties={typeid:24,uuid:"F7E79E64-D024-433B-A32A-1934DE5CB699"}
 */
function loadDocument() {
	elements.pdfViewer.documentURL = documentURL;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3F39F8B8-ADA3-4888-8F3C-F4F8A5581B81"}
 */
function reload(event) {
	if(!elements.pdfViewer.noCache){
		application.output('reload() called with noCache==false. Will likely have no effect.',LOGGINGLEVEL.WARNING);
	}
	elements.pdfViewer.reload();
}
