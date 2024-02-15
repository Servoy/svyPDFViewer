$scope.api.setFieldValues = function(values) {
    $scope.model.fieldValues = values;
}

$scope.api.setToolbarControlsVisibility = function(ids, visible) {
    const obj = {};
    if (ids) {
        for (let i = 0; i< ids.length;i++) {
            obj[ids[i]] = visible;
        }
    }
    if ($scope.model.toolbarControlsVisibility){
        for (let id in $scope.model.toolbarControlsVisibility) {
            obj[id] = $scope.model.toolbarControlsVisibility[id];
        }
    }
    $scope.model.toolbarControlsVisibility = obj;
}

$scope.api.setFieldControlsVisibility = function(ids, visible) {
    const obj = {};
    if (ids) {
        for (let i = 0; i< ids.length;i++) {
            obj[ids[i]] = visible;
        }
    }
    if ($scope.model.fieldControlsVisibility){
        for (let id in $scope.model.fieldControlsVisibility) {
            obj[id] = $scope.model.fieldControlsVisibility[id];
        }
    }
    $scope.model.fieldControlsVisibility = obj;
}