/**
 *
 * @return {String}
 *
 * @properties={typeid:24,uuid:"3D8B05A5-3E07-4B43-941D-A1221CCEC8BB"}
 */
function getName() {
	return 'PDF.js';
}

/**
*
* @return {String}
*
* @properties={typeid:24,uuid:"E79A73AB-0092-4C08-A550-AA8B87C671E1"}
*/
function getDescription() {
	return 'Add support for viewing PDF files to your solution'
}

/**
*
* @return {RuntimeForm<AbstractMicroSample>}
*
* @properties={typeid:24,uuid:"F67F691C-13B9-43ED-9EE3-B07E3A4CC731"}
*/
function getParent() {
	return forms.specializedSamples;
}

/**
*
* @return {String}
*
* @properties={typeid:24,uuid:"9AA5244A-56AF-4DBD-B053-30D489E3767F"}
*/
function getIconStyleClass() {
	return 'fa fa-file-pdf-o';
}

/**
* @public 
* @return {Array<String>} code lines
* @properties={typeid:24,uuid:"EC2E5A73-A024-4921-A881-C3AE1F35C79F"}
*/
function getSampleCode() {
	return printMethodCode(forms.pdfViewer['loadDocument'])
}

/**
*
* @return {String} Website URL
*
* @properties={typeid:24,uuid:"4FD0ED45-58CE-494E-900D-621D5A5BFF23"}
*/
function getWebSiteURL() {
	return 'https://github.com/Servoy/svyPDFViewer';
}

/**
*
* @return {String} Additioanl info (wiki markdown supported)
*
* @properties={typeid:24,uuid:"77ABAD51-7868-4186-8FB9-979FFD633531"}
*/
function getMoreInfo() {
	var url = 'https://raw.githubusercontent.com/Servoy/svyPDFViewer/master/README.md';
	return plugins.http.getPageData(url);
}

/**
*
* @return {String} Download URL
*
* @properties={typeid:24,uuid:"7AA9E545-EBCD-45DD-A95D-B2C5D965AC88"}
*/
function getDownloadURL() {
	return 'https://api.github.com/repos/Servoy/svyPDFViewer/releases/latest';
}