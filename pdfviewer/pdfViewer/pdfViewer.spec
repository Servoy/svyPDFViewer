{
	"name": "pdfviewer-pdf-Viewer",
	"displayName": "pdfViewer",
	"version": 1,
	"definition": "pdfviewer/pdfViewer/pdfViewer.js",
	"libraries": [],
	"model":
	{
        "documentURL" 	: 	{"type" : "string"},
        "dataProviderID" : { "type":"dataprovider", "tags": { "scope" :"design" }},
		"noCache" : "boolean",
		"visible" : {"type": "visible" },
		"size" : {"type": "dimension",  "default" : {"width":100, "height":40}}
	},
	"api" : 
	{
		"reload" : {
            "delayUntilFormLoads": true 
        }
	}
}