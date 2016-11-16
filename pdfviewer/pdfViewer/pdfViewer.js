angular.module('pdfviewerPdfViewer',['servoy']).directive('pdfviewerPdfViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi",
          handlers: "=svyHandlers"
      },
      controller: function($scope, $element, $attrs) {
    	  
    	  $scope.$watch('model.svyMarkupId', function(newValue, oldValue) {
				if ($scope.model.svyMarkupId) {
					$scope.$evalAsync(function(){
						var frame = document.getElementById($scope.model.svyMarkupId);	
						if($scope.model.documentURL){
		    			  frame.src = $scope.model.documentURL;  
		    			}
					});
				}
			});
		  
		  $scope.api.loadDocument = function(url){
		  	var frame = document.getElementById($scope.model.svyMarkupId);	
	  		if(url){
	  			var r = Math.round(Math.random() * 10000000);
	  			url = url + '?r=' + r;  
	  		}
	  		frame.src = url;
		  };
      },
      templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
  })