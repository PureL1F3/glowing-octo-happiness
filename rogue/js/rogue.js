// Assumption - using 4 hour blocks to represent time [6-10AM, 10AM-2PM, 2-6PM, 6-10PM, 10PM-2AM, 2-6AM]

(function() {
    var app = angular.module('rogue', ['ui.bootstrap', 'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'partials/jobsearch-home.html',
            controller : 'HomeJobSearchCtrl'
        }).when('/jobresults', {
            templateUrl : 'partials/jobsearch-results.html',
            controller : 'HomeJobSearchCtrl'
        }).otherwise({
            redirectTo : '/'
        });
    }]);

    app.controller('JobSearchHomeCtrl', ['SearchAPI', '$scope', function($scope){
        $scope.SearchAPI = SearchAPI;

    }]);

    app.controller('JobSearchResultsCtrl', ['SearchAPI', 'StaticAPI', '$scope', function($scope){
        $scope.SearchAPI = SearchAPI;
    }]);


    app.service('SearchAPI', ['$http', 'StaticAPI', function($http, StaticAPI){

        this.SearchParams = {
            keywords : '',
            availability : StaticAPI.GetFullAvailability(),
            location : {
                name : '',
                geo : {
                    lat : null,
                    lon : null
                }
            }
        }

    }]);

    app.service('StaticAPI', ['$http', function($http) {

        this.JobFunctions = [
            { id: 1, name: 'Retail'},
            { id: 2, name: 'Cool School'}
        ];

        this.JobTypes = [
            { id: 1, name: 'Full-Time'}
        ];

        this.AvailabilityCategories = ['6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM'];
        this.AvailabilityDays = ['M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun'];

        this.JobSearchRadius = [5, 10, 25, 50, 100];


        this.GetFullAvailability = function() {

            var availability = [];
            for (var i = 0; i < this.AvailabilityDays.length; i++)
            {
                availability[i] = [];
                for(var j = 0; j < this.AvailabilityCategories.length; j++)
                {
                    availability[i].push(false);
                }
            }

            return availability;
        };


    }]);

    app.service('AccountAPI', ['$http', function($http) {
        this.Account = {
            "name" : "",
            "phone" : "",
            "email" : "",
            "password" : "",
            "employer" : false
        };
    }]);

    app.service('EmployerAPI', ['$http', function($http) {

    }]);

    app.service('JobSeekerAPI', ['$http', function($http) {

    }]);

    app.controller('EmployerRegistrationController', 
        ['$scope', 'StaticAPI', 'AccountAPI', 'EmployerAPI', 
        function($scope, StaticAPI, AccountAPI, EmployerAPI) {

        $scope.StaticAPI = StaticAPI;
        $scope.EmployerAPI = EmployerAPI;
        $scope.AccountAPI = AccountAPI;

        $scope.Registration = {
            "account" : $scope.AccountAPI.Account,
            "name" : "",
            "website" : "",
            "description" : ""
        };

        $scope.RegistrationError = null;
        $scope.RegistrationSubmitting = false;

        $scope.SubmitForm = function() {
            alert("registering employer");            
        };
    }] );

    app.controller('JobSeekerRegistrationController', 
        ['$scope', 'StaticAPI', 'AccountAPI', 'JobSeekerAPI', 
        function($scope, StaticAPI, AccountAPI, JobSeekerAPI) {

        $scope.StaticAPI = StaticAPI;
        $scope.JobSeekerAPI = JobSeekerAPI;
        $scope.AccountAPI = AccountAPI;


        $scope.Registration = {
            "account" : $scope.AccountAPI.Account,
            "location" : "",
            "lat" : "",
            "long" : "",
            "distance" : "",
            "resume" : "",
            "availability" : $scope.StaticAPI.GetFullAvailability(),
            "jobtypes" : [],
            "jobfunctions" : []
        };

        $scope.RegistrationError = null;
        $scope.RegistrationSubmitting = false;

        $scope.SubmitForm = function() {
            alert("registering job seeker");            
        };

    }]);

    app.controller('JobPostCandidateSeekerController', 
        ['$scope', 'StaticAPI', 'AccountAPI', 'JobSeekerAPI', 
        function($scope, StaticAPI, AccountAPI, JobSeekerAPI) {
    }]);

})();