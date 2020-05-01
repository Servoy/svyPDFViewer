/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"8355F6CB-ACDB-419D-A503-F2AC4B88C86C",variableType:4}
 */
var pageNumber = null;

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
	var file = plugins.http.getMediaData(documentURL);
	
	//Write the file to a remote file
	var remoteFileName = application.getUUID().toString() + '.pdf';
	var remoteFile = plugins.file.convertToRemoteJSFile('/'+remoteFileName)
	remoteFile.setBytes(file,true);
	
	//Convert the remote file to a url, and display it in the PDF viewer
	var remoteUrl = plugins.file.getUrlForRemoteFile('/'+remoteFileName);
	if(remoteUrl) {
		byteArray = null;
		elements.pdfViewer.documentURL = remoteUrl;
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
function loadDocumentDataprovider(event) {
	byteArray = solutionModel.getMedia('test.pdf').bytes;
}

/**
 * @param oldValue
 * @param newValue
 * @param {JSEvent} event
 *
 * @return {boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"43E911F6-C403-4410-A4D2-55571358752A"}
 */
function onDataChange(oldValue, newValue, event) {
	elements.pdfViewer.pageNumber = newValue;
	return false;
}
