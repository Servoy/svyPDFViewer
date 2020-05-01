{
	"name": "pdfviewer-pdf-Js-Viewer",
	"displayName": "pdfJsViewer",
	"version": 1,
	"definition": "pdfviewer/pdfJsViewer/pdfJsViewer.js",
	"libraries": [],
	"model":
		{
		"documentURL" 	: 	{"type" : "string"},
		"styleSheet" 	: 	{"type" : "media", "tags": {"scope":"design"}},
		"noCache" 		:	{"type" : "boolean"},
		"frameSrc" 		:	{"type" : "string", "tags" : {"scope" : "private"}},
		"visible" 		:	{"type": "visible" },
		"size" 			:	{"type": "dimension",  "default" : {"width":100, "height":40}}, 
    	"location" 		:	{"type": "point"},
    	"pageNumber"	:   {"type": "int"},
    	"zoomLevel"		:   {"type": "string"}
	},
	"api" : 
	{
		"reload" : {
            "delayUntilFormLoads": true
        }
	}
}