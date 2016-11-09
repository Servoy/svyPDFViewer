angular.module('pdfviewerPdfViewer',['servoy']).directive('pdfviewerPdfViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi",
          handlers: "=svyHandlers"
      },
      controller: function($scope, $element, $attrs) {
    	  
    	  $scope.api.setDocument = function(url){
    	  	var frame = document.getElementById('abc123');	
    	  	frame.src = url;
//    	  	alert('MARKUP: ' + $scope.model.svyMarkupId);
    	  }
    	  
    	  $scope.$watch('model.documentURL', function() {
    		  var frame = document.getElementById('abc123');	
    		  if($scope.model.documentURL){
    			  frame.src = $scope.model.documentURL;  
    		  }
    	  });
			     
      },
      templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
  })