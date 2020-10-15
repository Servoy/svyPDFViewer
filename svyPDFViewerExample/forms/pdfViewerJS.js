/**
 * @properties={typeid:35,uuid:"100AFDEC-AD11-4EC1-B4C0-9EBD6CB69FA1",variableType:-4}
 */
var byteArray

/**
 * This is the document URL to load
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FAAAC345-AD6E-4068-8F2F-D4653BCCE0AB"}
 */
var documentURL = 'https://servoy.com/download/reflecta-case-study/?wpdmdl=4295';

/**
 * (Re)Loads the document
 * @private 
 *
 * @properties={typeid:24,uuid:"F7E79E64-D024-433B-A32A-1934DE5CB699"}
 */
function loadDocument() {
	//Download the remote file
	var file = plugins.http.getMediaData(encodeURI(documentURL));
	if(file) {
		byteArray = file;
	}
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"99D60C2B-DA26-43F9-B8A4-66DDC19D7862"}
 */
function onShow(firstShow, event) {
	loadDocument();
}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B482AE1C-AE84-4FE6-9619-35A25B485808"}
 */
function resetToDefault(event) {
	documentURL = 'https://servoy.com/download/reflecta-case-study/?wpdmdl=4295';
	loadDocument()
}
