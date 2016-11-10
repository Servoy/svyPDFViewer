angular.module('pdfviewerPdfViewer',['servoy']).directive('pdfviewerPdfViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi",
          handlers: "=svyHandlers"
      },
      controller: function($scope, $element, $attrs) {
    	  
    	  $scope.$watch('model.documentURL', function() {
    		  var frame = document.getElementById($scope.model.svyMarkupId);	
    		  if($scope.model.documentURL){
    			  frame.src = $scope.model.documentURL;  
    		  }
    	  });
      },
      templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
  })