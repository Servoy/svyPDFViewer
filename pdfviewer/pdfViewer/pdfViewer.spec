{
    "name": "pdfviewer-pdf-Viewer",
    "displayName": "pdfViewer",
    "categoryName": "Media",
    "version": 1,
    "icon": "pdfviewer/pdfViewer/icon.png",
    "definition": "pdfviewer/pdfViewer/pdfViewer.js",
    "doc": "pdfviewer/pdfViewer/pdfViewer_doc.js",
    "libraries": [{"name":"pdfviewer-pdfViewer-css", "version":"1.0", "url":"pdfviewer/pdfViewer/pdfViewer.css", "mimetype":"text/css"}],
    "model":
    {
        "documentURL"   : {"type" : "string"},
        "dataProviderID": {"type":"dataprovider", "tags": { "wizard": true, "scope" :"design" }},
        "styleClass"    : {"type" :"styleclass", "tags": { "scope" :"design" }},
        "noCache"       : {"type" : "boolean"},
        "visible"       : {"type": "visible" },
        "size"          : {"type": "dimension",  "default" : {"width":50, "height":50}},
        "tabSeq"        : {"type" :"tabseq", "tags": { "scope" :"design" }}
    },
    "api" : 
    {
        "reload" : {
            "delayUntilFormLoads": true 
        }
    }
}