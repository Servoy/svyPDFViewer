var AdmZip = require('adm-zip');

// creating archives
var zip = new AdmZip();

zip.addLocalFolder("./META-INF/", "/META-INF/");
zip.addLocalFolder("./dist/servoy/pdfviewer/", "/dist/servoy/pdfviewer/");

zip.writeZip("pdfviewer.zip")