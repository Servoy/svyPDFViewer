angular.module('pdfviewerPdfViewer',['servoy']).directive('pdfviewerPdfViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi"
      },
      controller: function($scope, $element, $attrs, $sce) {
    	  
    	  // wait for element to load
    	  $scope.$watch('model.svyMarkupId', function(newValue, oldValue) {
				if ($scope.model.svyMarkupId) {
					$scope.$evalAsync(function(){
						$scope.loadDocument();
					});
				}
			});
		  
    	  // watch doc url
    	  $scope.$watch('model.documentURL', function(newValue, oldValue) {
    		  $scope.loadDocument();
    	  });
    	  
    	  // reload doc
    	  $scope.api.reload = function(){
    		  // load doc
    		  $scope.loadDocument();
    	  };
    	  
    	  // load doc
		  $scope.loadDocument = function(){
	
		  	var url = $scope.model.documentURL;
		  	
		  	// check for noCache and generate random http param
	  		if(url && $scope.model.noCache === true){
	  			var r = Math.round(Math.random() * 10000000);
	  			url = url + '?r=' + r;  
	  		}
	  		$scope.model.frameSrc = $sce.trustAsResourceUrl(url);
		  };
      },
      templateUrl: 'pdfviewer/pdfViewer/pdfViewer.html'
    };
  })