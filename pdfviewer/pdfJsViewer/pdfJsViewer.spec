{
    "name": "pdfviewer-pdf-Js-Viewer",
    "displayName": "pdfJsViewer",
    "categoryName": "Media",
    "version": 1,
    "icon": "pdfviewer/pdfJsViewer/icon.png",
    "definition": "pdfviewer/pdfJsViewer/pdfJsViewer.js",
    "libraries": [{"name":"pdfviewer-pdfjsviewer-css", "version":"1.0", "url":"pdfviewer/pdfJsViewer/pdfJsViewer.css", "mimetype":"text/css"}],
    "ng2Config": {
        "assets": [
            {
                "glob" : "**/*",
                "input" : "node_modules/ng2-pdfjs-viewer/pdfjs",
                "output" : "/pdfjs"
            }
        ]
    },
    "model":
    {
        "documentURL"   :   {"type" : "string"},
        "dataProviderID":   {"type":"dataprovider", "tags": { "scope" :"design" }},
        "styleSheet"    :   {"type" : "media", "tags": {"scope":"design"}},
        "styleClass"    :   {"type" :"styleclass", "tags": { "scope" :"design" }},
        "noCache"       :   {"type" : "boolean"},
        "visible"       :   {"type": "visible" },
        "size"          :   {"type": "dimension",  "default" : {"width":50, "height":50}}, 
        "pageNumber"    :   {"type": "int"},
        "tabSeq"        :   {"type" :"tabseq", "tags": { "scope" :"design" }},
        "zoomLevel"     :   {"type": "string"},
        "showToolbar"   :   {"type": "boolean", "default" : false},
        "enableTooltips":   {"type": "boolean", "default" : false}
    },
    "api" : 
    {
        "loadDocument" : {
        	"parameters" : 	[
        						{
        							"name": "documentURL",
        							"type": "string"
        						},
        						{
        							"name": "values",
        							"type": "object",
        							"optional": true
        						},
        						{
        							"name": "staticForm",
        							"type": "boolean",
        							"optional": true
        						}
        					],
            "delayUntilFormLoads": true
        },
        "reload" : {
            "delayUntilFormLoads": true
        },
        "getFieldValues" : {
            "delayUntilFormLoads": true,
            "returns": "object"
        },
        "setFieldValues" : {
            "parameters" : [
                {"name" : "values", "type" : "object"},
                {"name" : "timeout", "type" : "number", "optional" : true}
            ],
            "delayUntilFormLoads": true
        },
        "getFieldNames" : {
            "delayUntilFormLoads": true,
            "returns": "string[]"
        },
        "getControlIds" : {
            "delayUntilFormLoads": true,
            "returns": "string[]"
        },
        "setControlsVisibility" : {
            "parameters" : [
                {"name" : "ids", "type" : "string[]"},
                {"name" : "visible", "type" : "boolean"}
            ],
            "delayUntilFormLoads": true
        }
    }
}
