/**
 * This is the document URL to load
 * 
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"48E54C46-86AC-41C9-908D-1B1B349A5207",variableType:8}
 */
var pageNumber = 1

/**
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"96D4BE91-DC47-4E86-BE36-842B82A74531"}
 */
var zoomLevel = 'auto'

/**
 * (Re)Loads the document
 * @private 
 *
 * @properties={typeid:24,uuid:"E391A342-3E72-4FF0-BE9F-76CB2ACAF785"}
 */
function loadDocument() {
	var testPdf = solutionModel.getMedia('test.pdf');
	var tempFile = plugins.file.createTempFile('','.pdf');
	plugins.file.writeFile(tempFile,testPdf.bytes)
	plugins.file.streamFilesToServer(tempFile)
	var uri = plugins.file.getUrlForRemoteFile('/' + tempFile.getName())
	elements.pdfViewer.zoomLevel = zoomLevel
	elements.pdfViewer.pageNumber = pageNumber
	elements.pdfViewer.documentURL = uri;
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"A2E40CE5-D39C-44BD-95CE-77745FABB4D1"}
 */
function onShow(firstShow, event) {
	loadDocument();
}
