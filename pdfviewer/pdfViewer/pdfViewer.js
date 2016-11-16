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
    		  var r = Math.round(Math.random() * 10000000);
    		  if($scope.model.documentURL){
    			  frame.src = $scope.model.documentURL + '?r=' + r;  
    		  }
    	  });
    	  
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
    	  
    	  $scope.api.reload = function(){
			var frame = document.getElementById($scope.model.svyMarkupId);	
			var r = Math.round(Math.random() * 10000000);
	  		  if($scope.model.documentURL){
	  			  frame.src = $scope.model.documentURL + '?r=' + r;  
	  		  }
		  };
      },
      templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
  })