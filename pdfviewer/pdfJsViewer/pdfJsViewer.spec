{
    "name": "pdfviewer-pdf-Js-Viewer",
    "displayName": "pdfJsViewer",
    "categoryName": "Media",
    "version": 1,
    "icon": "pdfviewer/pdfJsViewer/icon.png",
    "definition": "pdfviewer/pdfJsViewer/pdfJsViewer.js",
    "serverscript": "pdfviewer/pdfJsViewer/pdfJsViewer_server.js",
    "doc": "pdfviewer/pdfJsViewer/pdfJsViewer_doc.js",
    "libraries": [{"name":"pdfviewer-pdfjsviewer-css", "version":"1.0", "url":"pdfviewer/pdfJsViewer/pdfJsViewer.css", "mimetype":"text/css"}],
    "ng2Config": {
        "assets": [
            {
                "glob" : "**/*",
                "input" : "node_modules/@servoy/pdfviewer/assets/pdfjs",
                "output" : "/pdfjs"
            }
        ]
    },
    "model":
    {
        "documentURL"   :   {"type" : "string"},
        "dataProviderID":   {"type":"dataprovider", "tags": { "wizard": true, "scope" :"design" }},
        "styleSheet"    :   {"type" : "media", "tags": {"scope":"design"}},
        "styleClass"    :   {"type" :"styleclass", "tags": { "scope" :"design" }},
        "noCache"       :   {"type" : "boolean"},
        "visible"       :   {"type": "visible" },
        "size"          :   {"type": "dimension",  "default" : {"width":50, "height":50}}, 
        "pageNumber"    :   {"type": "int"},
        "tabSeq"        :   {"type" :"tabseq", "tags": { "scope" :"design" }},
        "zoomLevel"     :   {"type": "string"},
        "showToolbar"   :   {"type": "boolean", "default" : true},
        "enableTooltips":   {"type": "boolean", "default" : false},
        "fieldValues"   :   {"type" :"map", "tags": { "scope" :"private" }},
        "toolbarControlsVisibility"   :   {"type" :"map", "tags": { "scope" :"private" }},
        "fieldControlsVisibility"   :   {"type" :"map", "tags": { "scope" :"private" }}
    },
    "api" : 
    {
        "reload" : {
            "delayUntilFormLoads": true
        },
        "getFieldValues" : {
            "returns": "map"
        },
        "setFieldValues" : {
            "parameters" : [
                {"name" : "values", "type" : "map"}
            ]
        },
        "getFieldNames" : {
            "returns": "string[]"
        },
        "getToolbarControlIds" : {
            "returns": "string[]"
        },
        "setToolbarControlsVisibility" : {
            "parameters" : [
                {"name" : "ids", "type" : "string[]"},
                {"name" : "visible", "type" : "boolean"}
            ]
        },
        "setFieldControlsVisibility" : {
            "parameters" : [
                {"name" : "names", "type" : "string[]"},
                {"name" : "visible", "type" : "boolean"}
            ]
        }
    },
    "handlers" :
    {
        "onPageChanged" : {
            "parameters" : [
                {
                    "type": "int",
                    "name" : "pageNumber",
                    "description" : "The page number of the new page that is displayed"
                }, {
                    "type": "int",
                    "name" : "previousPageNumber",
                    "description" : "The page number of the page that was previously displayed"
                }
            ]
        }
    }
}
