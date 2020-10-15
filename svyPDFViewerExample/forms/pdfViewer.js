/**
 * @properties={typeid:35,uuid:"E2A72A38-9A5B-4A0A-9C9B-FE9E2EAB55CB",variableType:-4}
 */
var byteArray;

/**
 * This is the document URL to load
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"13F2FB02-6400-4DB7-ABF3-57599189FCCC"}
 */
var documentURL = 'https://servoy.com/download/reflecta-case-study/?wpdmdl=4295';

/**
 * (Re)Loads the document
 * @private 
 *
 * @properties={typeid:24,uuid:"E762D253-C9CF-42BC-BDD6-12372C3BE60F"}
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
 * @properties={typeid:24,uuid:"B8F74CAB-4968-4173-9C69-91C4CA40C30D"}
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
 * @properties={typeid:24,uuid:"E9AE09A0-8976-459E-9819-1952FAEBC42C"}
 */
function resetToDefault(event) {
	documentURL = 'https://servoy.com/download/reflecta-case-study/?wpdmdl=4295';
	loadDocument()
}
