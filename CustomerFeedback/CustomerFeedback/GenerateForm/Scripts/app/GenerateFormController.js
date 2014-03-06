﻿var formCells = [];//only id arra
var formCellArray = [];//all details
app.generateForm.controller('GenerateFormCtrl', function ($scope, $timeout, $http, sharedProperties) {
    var removeItem = breeze.core.arrayRemoveItem;
    var instance = breeze.config.initializeAdapterInstance("ajax", "angular", true);

    var dSAppraisal = app.GenerateFormDataserviceAppraisal;
    var logger = app.logger;


    $scope.cellGrid = [];

    $scope.employeeListData = [];
    $scope.Ratings = [];

    $scope.empNameList;
    $scope.compareArray = [];

    $scope.RatingList = [];

    $scope.apploadCount = 0;//To find weather new appraisal has reloaded

    $scope.noOfEvaluations = 0;

    $scope.isSubmitable = true;

    $scope.popColor = "{ color: 'red' }";


    $scope.DataLoaded = false;
    $scope.mytempvar = 0;
    $scope.isCollapsedComp = true;
    $scope.getAllAppraisals = function () {

        dSAppraisal.getAppraisalData()
            .then(function (data) {
                $scope.appraisalData = data.results[0];
                $scope.criteriaData = [];
                for (var l = 0; l < $scope.appraisalData.template.templateStructures.length; l++) {

                    $scope.criteriaData.push({
                        'criteria_id': $scope.appraisalData.template.templateStructures[l].criteria.criteria_id,
                        'criteria_type': $scope.appraisalData.template.templateStructures[l].criteria.criteria_type,
                        'criteria_description': $scope.appraisalData.template.templateStructures[l].criteria.criteria_description,
                        'criteria_caption': $scope.appraisalData.template.templateStructures[l].criteria.criteria_caption,
                        'rating_guide': $scope.appraisalData.template.templateStructures[l].criteria.rating_guide,
                        'comments': "",
                        'rating': { 'label': "", 'index': "" }
                    });
                }
                if ($scope.criteriaData.length % 2 === 0) {
                    $scope.devideFactor = ($scope.criteriaData.length / 2) - 1;
                }
                else {
                    $scope.devideFactor = (($scope.criteriaData.length + 1) / 2) - 1;
                }


                //****************

                dSAppraisal.getEvaluationData()
            .then(function (data) {
                $scope.evaluationData = data.results;

                $scope.noOfEvaluations = $scope.evaluationData.length;

                for (var j = 0; j < $scope.evaluationData.length; j++) {
                    $scope.employeeListData.push({
                        'employee_id': $scope.evaluationData[j].employee_id,
                        'employee_name': $scope.evaluationData[j].employee_name,
                        'evaluation_id': $scope.evaluationData[j].evaluation_id,
                        'appraisal_id': $scope.evaluationData[j].appraisal_id
                    });

                }

                $scope.empNameList = {
                    employee_name: $scope.evaluationData[0].employee_name,
                    employee_id: $scope.evaluationData[0].employee_id,
                    evaluation_id: $scope.evaluationData[0].evaluation_id,
                    appraisal_id: $scope.evaluationData[0].appraisal_id,
                };

                if ($scope.temp.AppraisalState === "2") {//appraisal state 2 mean it has already updated

                    for (var i = 0; i < $scope.evaluationData.length; i++) {
                        dSAppraisal.getRatingData($scope.evaluationData[i].evaluation_id)
                            .then(function (data) {

                                var singleRating = [];

                                data.results.forEach(function (item) {
                                    item.entityAspect.propertyChanged.subscribe(function () {

                                        setTimeout(
                                            function () {
                                                if (item.entityAspect.entityState.isModified()) {
                                                    dSAppraisal.saveChanges();
                                                }
                                            }
                                        , 100);
                                    });

                                    singleRating.push(item);
                                });

                                $scope.RatingList.push(singleRating);

                                singleRating = [];

                                var tempCriteriaData = angular.copy($scope.criteriaData);
                                var empName, empId;
                                var ratingArray = [];
                                for (var k = 0; k < $scope.employeeListData.length; k++) {
                                    if ($scope.employeeListData[k].evaluation_id === data.results[0].evaluation_id) {
                                        empName = $scope.employeeListData[k].employee_name;
                                        empId = $scope.employeeListData[k].employee_id;
                                    }
                                }

                                for (var r = 0; r < data.results.length; r++) {
                                    for (var n = 0; n < data.results.length; n++) {
                                        if (data.results[r].criteria_id === tempCriteriaData[n].criteria_id) {

                                            var guide = tempCriteriaData[n].rating_guide;
                                            var a = guide.split(",");

                                            tempCriteriaData[n].comments = data.results[r].comments;
                                            tempCriteriaData[n].rating.label = a[data.results[r].rating];
                                            tempCriteriaData[n].rating.index = data.results[r].rating;


                                        }
                                    }
                                }


                                //alert($scope.criteriaData[0].rating);
                                $scope.Ratings.push({ 'evaluation_id': data.results[0].evaluation_id, 'rating': tempCriteriaData, 'employee_name': empName, 'employee_id': empId, state: 0 });

                                if ($scope.Ratings.length === $scope.employeeListData.length) {
                                    $scope.DataLoaded = true;
                                    $scope.EmpEvaluation = $scope.Ratings[0];
                                    document.getElementById("jerk").click();
                                    $scope.stateIndicate();
                                }

                            })
                            .fail(function (data) {
                                logger.error("Rating data loading failed!!");
                            });

                    }
                }
                else if ($scope.temp.AppraisalState === "1") {//for  first time submitting appraisal

                    $scope.mytempvar = 1;
                    var empName, empId;

                    for (var k = 0; k < $scope.employeeListData.length; k++) {
                        var tempCriteriaData = angular.copy($scope.criteriaData);
                        empName = $scope.employeeListData[k].employee_name;
                        empId = $scope.employeeListData[k].employee_id;
                        $scope.Ratings.push({ 'evaluation_id': $scope.employeeListData[k].evaluation_id, 'rating': tempCriteriaData, 'employee_name': empName, 'employee_id': empId, state: 0 });
                    }


                    var singleRating = [];
                    /*

                    
                    
                    */

                    if ($scope.Ratings.length === $scope.employeeListData.length) {
                        $scope.DataLoaded = true;
                        $scope.EmpEvaluation = $scope.Ratings[0];
                        document.getElementById("jerk").click();
                        $scope.stateIndicate();
                    }

                    // dSAppraisal.saveChanges().fail(addFailed);

                    function addFailed() {

                    }

                    function changeButtonStyle() {

                    }

                    //dSAppraisal.invalidateAppraisal($scope.employeeListData[0].appraisal_id, $scope.temp.AppraisalState);

                }

                $scope.$apply();
                //logger.info("Data loaded!!");
            })
            .fail(function (data) {
                logger.error("error occuerd when fetching evaluation data.Restart the application");
            });
                //*****************


                $scope.$apply();
                //logger.info("Data loaded!!");
            })
            .fail(function (data) {
                alert("error occuerdwhen fetching appraisal data");
                logger.error("Data loading failed!!");
            });

    };

    $scope.getAllAppraisals();


    $scope.stateIndicate = function () {

        /*Rating state 0 : still not even touched,state 1 : middle ,state 2 : finish */

        var state = 2;
        var IsMiddle = 0;

        if ($scope.isSubmitable) {
            $scope.isSubmitable = false;
            document.getElementById("save").disabled = true;
            document.getElementById("save").className = "gray";
        }

        for (var eval_run = 0; eval_run < $scope.Ratings.length; eval_run++) {

            for (var cri_run = 0; cri_run < $scope.Ratings[eval_run].rating.length; cri_run++) {

                if ($scope.Ratings[eval_run].rating[cri_run].criteria_type === 1 && ($scope.Ratings[eval_run].rating[cri_run].rating.index === -1 || $scope.Ratings[eval_run].rating[cri_run].rating.index === "")) {
                    state = 0;
                }
                if ($scope.Ratings[eval_run].rating[cri_run].criteria_type === 2 && $scope.Ratings[eval_run].rating[cri_run].comments === "") {
                    state = 0;
                }
                if (($scope.Ratings[eval_run].rating[cri_run].criteria_type === 1 && ($scope.Ratings[eval_run].rating[cri_run].rating.index !== -1 && $scope.Ratings[eval_run].rating[cri_run].rating.index !== '')) || $scope.Ratings[eval_run].rating[cri_run].criteria_type === 2 && $scope.Ratings[eval_run].rating[cri_run].comments !== "") {
                    IsMiddle = 1;
                }
            }
            if (state === 0 && IsMiddle === 1) {
                //$scope.popColor = "{ color: 'yellow' }";
                $scope.Ratings[eval_run].state = "{ color: '#f6f7a2' }";//intermediate
                // $scope.btnStyle = "{ color: 'yellow' }";
                //document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).style.backgroundColor = '#f6f7a2';
                document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).className = "intermideate";
                $scope.isSubmitable = false;
                if (!$scope.isSubmitable) {
                    document.getElementById("save").disabled = true;
                    document.getElementById("save").className = "gray";
                }

            }
            if (state === 2 && IsMiddle === 1) {
                // $scope.popColor = "{ color: 'green' }";
                $scope.EmpEvaluation.state = "{ color: '#C6FEB3' }";//completed state
                //$scope.btnStyle = "{ color: 'green' }";
                //document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).style.backgroundColor = '#C6FEB3';
                document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).className = "success_fin";
            }
            if (state === 0 && IsMiddle === 0) {
                //$scope.popColor = "{ color: 'red' }";
                $scope.Ratings[eval_run].state = "{ color: '#FEEEF9' }";//fresh
                //$scope.btnStyle = "{ color: 'red' }";
                //document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).style.backgroundColor = '#FEEEF9';
                document.getElementById("empName_" + $scope.Ratings[eval_run].evaluation_id).className = "newbie";
                $scope.isSubmitable = false;
                if (!$scope.isSubmitable) {
                    document.getElementById("save").disabled = true;
                    document.getElementById("save").className = "gray";
                }

            }
            IsMiddle = 0;
            state = 2;
        }


    }


    $scope.clickJerk = function () {
        document.getElementById("jerk").style.visibility = 'hidden';
    }
    function getColor() {
        return $scope.EmpEvaluation.state;
    }





    //save the binded data of form to database

    var hasChanged = false;
    var isnewApp = false;
    $scope.saveToDB = function () {
        $scope.isSubmitable = true;
        if ($scope.mytempvar !== 1) {
            var eval_id_temp;
            for (var breeze_object = 0; breeze_object < $scope.RatingList.length; breeze_object++) {
                eval_id_temp = $scope.RatingList[breeze_object][0].evaluation_id;

                for (var ang_object = 0; ang_object < $scope.RatingList.length; ang_object++) {
                    if (eval_id_temp === $scope.Ratings[ang_object].evaluation_id) {

                        for (var cri_id_temp = 0; cri_id_temp < $scope.RatingList[breeze_object].length; cri_id_temp++) {

                            for (var cri_id_ratingList = 0; cri_id_ratingList < $scope.Ratings[ang_object].rating.length; cri_id_ratingList++) {

                                if ($scope.RatingList[breeze_object][cri_id_temp].criteria_id === $scope.Ratings[ang_object].rating[cri_id_ratingList].criteria_id) {

                                    $scope.RatingList[breeze_object][cri_id_temp].rating = $scope.Ratings[ang_object].rating[cri_id_ratingList].rating.index;
                                    $scope.RatingList[breeze_object][cri_id_temp].comments = $scope.Ratings[ang_object].rating[cri_id_ratingList].comments;
                                    saveIfModified($scope.RatingList[breeze_object][cri_id_temp]);

                                    if ($scope.Ratings[ang_object].rating[cri_id_ratingList].criteria_type === 1 && $scope.Ratings[ang_object].rating[cri_id_ratingList].rating.index === -1) {
                                        $scope.isSubmitable = false;
                                    }
                                    if ($scope.Ratings[ang_object].rating[cri_id_ratingList].criteria_type === 2 && $scope.Ratings[ang_object].rating[cri_id_ratingList].comments === "") {
                                        $scope.isSubmitable = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (hasChanged) {
            dSAppraisal.saveChanges();
        }

        if ($scope.mytempvar === 1) {

            for (var eval_run = 0; eval_run < $scope.Ratings.length; eval_run++) {

                for (var cri_run = 0; cri_run < $scope.Ratings[eval_run].rating.length; cri_run++) {

                    var tempIndex = -1;
                    if ($scope.Ratings[eval_run].rating[cri_run].rating.index !== "") {
                        tempIndex = $scope.Ratings[eval_run].rating[cri_run].rating.index;
                    }

                    var item = dSAppraisal.createRating({
                        evaluation_id: $scope.Ratings[eval_run].evaluation_id,
                        criteria_id: $scope.Ratings[eval_run].rating[cri_run].criteria_id,
                        rating: tempIndex,
                        comments: $scope.Ratings[eval_run].rating[cri_run].comments
                    });

                    if ($scope.Ratings[eval_run].rating[cri_run].criteria_type === 1 && $scope.Ratings[eval_run].rating[cri_run].rating.index === -1) {
                        $scope.isSubmitable = false;
                    }
                    if ($scope.Ratings[eval_run].rating[cri_run].criteria_type === 2 && $scope.Ratings[eval_run].rating[cri_run].comments === "") {
                        $scope.isSubmitable = false;
                    }

                }
            }
            dSAppraisal.saveChangesNew().then(function () {
                dSAppraisal.invalidateAppraisal($scope.employeeListData[0].appraisal_id, $scope.temp.AppraisalState);
                $scope.Ratings = [];
                $scope.employeeListData = [];
                $scope.empNameList;
                $scope.compareArray = [];

                $scope.RatingList = [];
                $scope.DataLoaded = false;
                $scope.apploadCount++;
                $scope.temp.AppraisalState = "2";
                $scope.mytempvar = 0;
                if ($scope.apploadCount === 1) {
                    setTimeout($scope.getAllAppraisals(), 1000);
                }
            })
            .fail(function () {
                logger.error("restart the application");
            });
        }

        if ($scope.isSubmitable) {
            document.getElementById("save").disabled = false;
            document.getElementById("save").className = "yellow";
        }



        function extendItem(item) {

            item.entityAspect.propertyChanged.subscribe(function () {

                setTimeout(function () { saveIfModified(item); }, 100);
            });
        }

        function saveIfModified(item) {
            if (item.entityAspect.entityState.isModified()) {
                hasChanged = true;
            }
        }

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }

        logger.info("Appraisal saved temporaly!!");

    }

    $scope.save = function () {
        logger.success("Saved to db Successfully");
        dSAppraisal.invalidateAppraisal(getURLParameter('app_id'), $scope.temp.AppraisalState);
        $scope.temp.templateT = { name: 'formFilled.html', url: 'GenerateForm/templates/formFilled.html' };

        function addFailed() {

        }

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }

    }

    $scope.changeRating = function (evaluationId) {
        for (var i = 0; i < $scope.Ratings.length; i++) {
            if ($scope.Ratings[i].evaluation_id === evaluationId) {
                $scope.EmpEvaluation = $scope.Ratings[i];
            }
        }

    }

    $scope.optionalField = function () {
        if ($scope.isSubmitable) {
            $scope.isSubmitable = false;
            document.getElementById("save").disabled = true;
            document.getElementById("save").className = "gray";
        }
    }





});

app.generateForm.controller('selectRatings', function ($scope, $timeout, $http) {


});

app.generateForm.controller('SingleCell', function ($scope, $timeout, $http, sharedProperties) {
    $scope.isCollapsed = true;

    $scope.isFilled = false;
    $scope.showRatedValus = false;


    $scope.commentControl = function () {

    }


    $scope.pressRadio = function (cri_id, emp_id, eve_id, rating, commentValue) {
        $scope.showRatedValus = true;

        var ratingItem = {
            evaluation_id: eve_id,
            criteria_id: cri_id,
            rating: rating,
            comments: commentValue
        };
        if (!$scope.isFilled) {
            //document.getElementById(cri_id + "_" + emp_id).style.backgroundColor = "#cfe7b2";
        }

        if ($.inArray(cri_id + "_" + emp_id, formCells) < 0) {

            formCells.push(cri_id + "_" + emp_id);
            formCellArray.push(ratingItem);
        }
        else {

            for (var i = 0; i < formCellArray.length; i++) {
                if (cri_id === formCellArray[i].criteria_id && eve_id === formCellArray[i].evaluation_id) {
                    if (parseInt(rating) > 0) {
                        formCellArray[i].rating = rating;
                    }
                    else if (parseInt(rating) == 0) {
                        formCellArray[i].comments = commentValue;
                    }
                    break;
                }
            }
        }
    }




    //sharedProperties.setProperty($scope.formCells);

});