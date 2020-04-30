angular.module('pdfviewerPdfJsViewer',['servoy']).directive('pdfviewerPdfJsViewer', function() {  
    return {
      restrict: 'E',
      scope: {
    	  model: '=svyModel',
		  api: "=svyApi"
      },
      controller: function($scope, $element, $attrs,$sce, $timeout) {
    	  // reload doc
    	  $scope.api.reload = function(){
    		  // load doc
    		  $scope.loadDocument();
    	  };
    	  
    	  // load doc
		  $scope.loadDocument = function(){
		  	var url = "pdfviewer/pdfJsViewer/web/viewer.html";
		  	if(!$scope.model.documentURL) {
		  		$scope.model.frameSrc = $sce.trustAsResourceUrl(url);
		  		return false;
		  	} else {
		  		url += "?file="+ ($scope.model.documentURL);
		  	}
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
	  		
	  		// add custom CSS to the iframe
	  		if ($scope.model.styleSheet) {
	  			
	  			// wait for the markup id
	  			$timeout(function () {
		  			var iframe = document.getElementById($scope.model.svyMarkupId);
					$(iframe).on('load', function (event) {
			  			var link = document.createElement("link");
				  		link.href = "../../../" + $scope.model.styleSheet;
				  		link.rel = "stylesheet"; 
				  		link.type = "text/css"; 
				  		frames[0].document.head.appendChild(link);				    
					});
	  			})
	  		}
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