{
	"name": "pdfviewer-pdf-Viewer",
	"displayName": "pdfViewer",
	"version": 1,
	"definition": "pdfviewer/pdfViewer/pdfViewer.js",
	"libraries": [],
	"model":
	{
		"documentURL" : "string",
		"noCache" : "boolean",
		"frameSrc" : {"type" : "string", "tags" : {"scope" : "private"}},
		"visible" : {"type": "visible" },
		"size" : {"type": "dimension",  "default" : {"width":100, "height":40}}, 
    	"location" : {"type": "point"}
	},
	"api" : 
	{
		"reload" : {}
	}
}