angular.module('pdfviewerPdfJsViewer',['servoy']).directive('pdfviewerPdfJsViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi"
      },
      controller: function($scope, $element, $attrs,$sce) {
    	  // reload doc
    	  $scope.api.reload = function(){
    		  // load doc
    		  $scope.loadDocument();
    	  };
    	  
    	  // load doc
		  $scope.loadDocument = function(){
		 	if(!$scope.model.documentURL) {
			  return;
	  		}
		  		
		  	var url = "pdfviewer/pdfJsViewer/web/viewer.html?file="+ ($scope.model.documentURL);
			var urlExt = [];
		  	// check for noCache and generate random http param
	  		if($scope.model.noCache === true){
	  			var r = Math.round(Math.random() * 10000000);
	  			urlExt.push('r=' + r);
	  		}
	  		if($scope.model.pageNumber != null && $scope.model.pageNumber >= 1) {
	  			urlExt.push('page=' + $scope.model.pageNumber)
	  		}
	  		
	  		if($scope.model.zoomLevel != null) {
	  			urlExt.push('zoom=' + $scope.model.zoomLevel)
	  		}
	  		
			if(urlExt.length > 0) {
				url+= '#' + urlExt.join('&');
			}
	  		$scope.model.frameSrc = $sce.trustAsResourceUrl(url);
		  };
		  
		  
		  
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
    		  if(newValue) {
    		  		$scope.loadDocument();
    		  }
    	  });
      },
      templateUrl: 'pdfviewer/pdfJsViewer/pdfJsViewer.html'
    };
  })