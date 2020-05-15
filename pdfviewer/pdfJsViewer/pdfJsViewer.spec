{
	"name": "pdfviewer-pdf-Js-Viewer",
	"displayName": "pdfJsViewer",
	"categoryName": "Media",
	"version": 1,
	"icon": "pdfviewer/pdfJsViewer/icon.png",
	"definition": "pdfviewer/pdfJsViewer/pdfJsViewer.js",
	"libraries": [{"name":"pdfviewer-pdfjsviewer-css", "version":"1.0", "url":"pdfviewer/pdfJsViewer/pdfJsViewer.css", "mimetype":"text/css"}],
	"model":
		{
        "documentURL" 	: 	{"type" : "string"},
        "dataProviderID":   {"type":"dataprovider", "tags": { "scope" :"design" }},
        "styleSheet" 	: 	{"type" : "media", "tags": {"scope":"design"}},
        "styleClass"    :   {"type" :"styleclass", "tags": { "scope" :"design" }},
		"noCache" 		:	{"type" : "boolean"},
		"visible" 		:	{"type": "visible" },
		"size" 			:	{"type": "dimension",  "default" : {"width":50, "height":50}}, 
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