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
    $scope.model.toolbarControlsVisibility = obj;
}

$scope.api.setFieldControlsVisibility = function(ids, visible) {
    const obj = {};
    if (ids) {
        for (let i = 0; i< ids.length;i++) {
            obj[ids[i]] = visible;
        }
    }
    $scope.model.fieldControlsVisibility = obj;
}