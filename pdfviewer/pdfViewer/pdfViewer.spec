{
	"name": "pdfviewer-pdf-Viewer",
	"displayName": "pdfViewer",
	"categoryName": "Media",
	"version": 1,
	"definition": "pdfviewer/pdfViewer/pdfViewer.js",
	"libraries": [{"name":"pdfviewer-pdfViewer-css", "version":"1.0", "url":"pdfviewer/pdfViewer/pdfViewer.css", "mimetype":"text/css"}],
	"model":
	{
        "documentURL"   : {"type" : "string"},
        "dataProviderID": {"type":"dataprovider", "tags": { "scope" :"design" }},
        "styleClass"    :   {"type" :"styleclass", "tags": { "scope" :"design" }},
		"noCache" 		: {"type" : "boolean"},
		"visible"       : {"type": "visible" },
		"size"          : {"type": "dimension",  "default" : {"width":50, "height":50}}
	},
	"api" : 
	{
		"reload" : {
            "delayUntilFormLoads": true 
        }
	}
}