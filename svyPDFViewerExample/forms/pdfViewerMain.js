/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8AE837EB-E8B2-4475-B6D9-C02827B0077B"}
 */
var url = 'test.pdf';
	
/**
 * @properties={typeid:24,uuid:"D3DA7B81-04FD-4C48-878A-3173DDD37E93"}
 */
function testViewerChange(){
	
	elements.tabs.removeAllTabs();
	forms.pdfViewer.elements.pdfViewer.documentURL = url;
	elements.tabs.addTab(forms.pdfViewer);
	if(url == 'test.pdf'){
		url = 'http://www.cbu.edu.zm/downloads/pdf-sample.pdf';
	} else {
		url = 'test.pdf';
	}
}