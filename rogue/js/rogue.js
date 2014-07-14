// Assumption - using 4 hour blocks to represent time [6-10AM, 10AM-2PM, 2-6PM, 6-10PM, 10PM-2AM, 2-6AM]

(function() {
    var app = angular.module('rogue', ['ui.bootstrap', 'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'partials/jobsearch-home.html',
            controller : 'JobSearchHomeCtrl'
        }).when('/employer/dashboard', {
            templateUrl : 'partials/employer-posted.html',
            controller : 'EmployerDashboardCtrl'
        }).when('/jobseeker/dashboard', {
            templateUrl : 'partials/jobseeker-dashboard.html',
            controller : 'JobSeekerDashboardCtrl'
        }).when('/jobresults', {
            templateUrl : 'partials/jobsearch-results.html',
            controller : 'JobSearchResultsCtrl'
        }).when('/jobpost', {
            templateUrl : 'partials/jobpost-create.html',
            controller : 'JobPostCreateCtrl'
        }).when('/viewjob/:id', {
            templateUrl : 'partials/jobpost-view.html',
            controller : 'JobPostViewCtrl'
        }).when('/registration/employer/:next', {
            templateUrl : 'partials/registration-employer.html',
            controller : 'EmployerRegistrationController'
        }).when('/registration/jobseeker', {
            templateUrl : 'partials/registration-employee.html',
            controller : 'JobSeekerRegistrationController'
        }).otherwise({
            redirectTo : '/'
        });
    }]);

    app.controller('EmployerDashboardCtrl', ['$scope', function($scope){
        
    }]);

    app.controller('JobSearchHomeCtrl', ['SearchAPI', 'StaticAPI', '$scope', '$location', function(SearchAPI, StaticAPI, $scope, $location){
        $scope.StaticAPI = StaticAPI;
        $scope.OnSearch = function() {
            SearchAPI.SetSearchParams($scope.SearchParams);
            $location.path('/jobresults');
        };

        $scope.OnPostJob = function() {
            $location.path('/registration/jobseeker');
        };

        $scope.SearchParams = SearchAPI.GetSearchParams();
    }]);

    app.controller('JobSearchResultsCtrl', ['SearchAPI', 'StaticAPI', '$scope', function(SearchAPI, StaticAPI, $scope){
        $scope.StaticAPI = StaticAPI;
        $scope.SearchAPI = SearchAPI;
        $scope.SearchParams = SearchAPI.GetSearchParams();
        $scope.SearchParamsExpanded = false;
        $scope.ToggleSearchParamsExpanded = function() {
            $scope.SearchParamsExpanded = !$scope.SearchParamsExpanded;   
            console.log("toggling");
        }
    }]);

    app.controller('JobPostCreateCtrl', ['StaticAPI', 'EmployerAPI', '$scope', '$http', function(StaticAPI, EmployerAPI, $scope, $http) {
        var that = $scope;

        $scope.StaticAPI = StaticAPI;

        $scope.LoadingLocationMessage = null;
        $scope.Jobpost = {
            location : {
                name: '',
                lat: '',
                lon: ''
            },
            jobfunction : 0,
            jobtype : 0,
            employer : EmployerAPI.Employer.name,
            title : '',
            description : '',
            availability : StaticAPI.GetFullAvailability(),
            applicationtype : false,
            externalurl : ''
        };
        $scope.FormSubmitting = false;
        $scope.FormError = null;
        $scope.FormErrorMessage = null;

        $scope.ShowFormErrorMessage = function(message){
            $scope.FormErrorMessage = message;
        };

        $scope.SubmitJobPost = function() {
            $scope.FormSubmitting = true;
            $scope.FormError = null;
            $scope.FormErrorMessage = null;

            var config = {
                method: 'POST',
                url: '/rogue/create_jobpost.php',
                data: $scope.Jobpost
            };

            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowFormErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.FormError =  data.result.errors;
                        $scope.ShowFormErrorMessage('Your job post had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        
                    }
                }
                $scope.FormSubmitting = false;

            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.FormSubmitting = false;
                $scope.ShowFormErrorMessage('We could not process your job post. Please try again later.');
            });
        };

        $scope.GetLocation = function() {
            $scope.GettingLocation = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.OnGotLocationSuccess, $scope.OnGotLocationError, { timeout: 3000 });
                setTimeout(function(){
                    if($scope.LoadingLocationMessage) {
                        $scope.OnGotLocationError();
                }}, 4000);
                $scope.LoadingLocationMessage = 'Loading...';
            }
            else
            {
                $scope.LoadingLocationMessage = 'Please enter your postal code - your location is not available.';
            }
        }

        $scope.OnGotLocationError = function(error) {
            $scope.$apply(function() {
                that.GettingLocation = false;
                that.LoadingLocationMessage = 'Please enter your postal code - your location is not available.';
            });
        };

        $scope.OnGotLocationSuccess = function(position) {
            $scope.$apply(function() {
                that.LoadingLocationMessage = null;
                that.Jobpost.location.name = 'Current';
                that.Jobpost.location.lat = position.coords.latitude;
                that.Jobpost.location.lon = position.coords.longitude;
            });
        };
    }]);

    app.service('SearchAPI', ['$http', 'StaticAPI', function($http, StaticAPI){
        this.SearchResults = {
            offset : 0,
            limit : 10,
            total : 100,
            start : 1,
            end : 10,
            results : [
                {
                    id : 1,
                    title : 'Beverage Manager',
                    employer : 'Red Wines Tavern',
                    postdate : '2014-07-04',
                    hours : {
                        match : 6,
                        job : 8,
                        coverage : 15
                    },
                    applied : false,
                    viewed : true
                }
            ]
        };

        this.GetEmptySearchParams = function() {
            var params = {
                keywords : '',
                availability : StaticAPI.GetFullAvailability(),
                location : {
                    name : '',
                    lat : 0,
                    lon : 0
                    }
                }
            };
            return params;
        };

        this.GetSearchParams = function() {
            return angular.copy(this.SearchParams);
        }

        this.SetSearchParams = function(params) {
            this.SearchParams = angular.copy(params);
        }

        this.NoResults = function() {
            return this.SearchResults.total === 0;
        }

        this.SearchParams = this.GetEmptySearchParams();
    }]);

    app.service('StaticAPI', ['$http', function($http) {
        var that = this;

        this.JobFunctions = [];

        this.JobTypes = [];

        this.AvailabilityCategories = ['6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM'];
        this.AvailabilityDays = ['M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun'];

        this.JobSearchRadius = [5, 10, 25, 50, 100];

        this.ApplicationTypes = [
            {id : false, name : "Apply via StreamHire"},
            {id : true, name : "Apply via External Application"}
        ];


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

        this.Load = function() {
            var config = {
                method: 'GET',
                url: '/rogue/static.php'
            };

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    that.FailedToLoad();
                }
                else
                {
                    that.JobFunctions = data.result.jobfunctions;
                    that.JobTypes = data.result.jobtypes;                
                }
            });
            $promise.error(function(data, status, headers, config) {
                that.FailedToLoad();
            });
        };

        this.FailedToLoad = function() {
            console.log("Failed to load static....");
        }

        this.Load();

    }]);

    app.service('AccountAPI', ['$http', function($http) {
        this.Account = {
            "name" : "",
            "phone" : "",
            "email" : "",
            "password" : "",
            "employer" : false
        };

        this.Load = function() {
            var config = {
                method: 'GET',
                url: '/rogue/load_account.php'
            };
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                if(!data.ok)
                {
                }
                else
                {
                    if(data.result){
                        this.Account = data.result.account;
                    }
                }
            });
        };
    }]);

    app.service('EmployerAPI', ['$http', function($http) {
        this.Employer = {
            'name' : 'Employer Name',
            'location' : {
                'name' : 'location name',

            }
        };

    }]);

    app.service('JobSeekerAPI', ['$http', function($http) {

    }]);

    app.controller('EmployerRegistrationController', 
        ['$scope', '$routeParams', '$location', '$http', '$routeParams', 'StaticAPI', 'AccountAPI', 'EmployerAPI', 
        function($scope, $routeParams, $location, $http, $routeParams, StaticAPI, AccountAPI, EmployerAPI) {

        //alert();

        $scope.StaticAPI = StaticAPI;
        $scope.EmployerAPI = EmployerAPI;
        $scope.AccountAPI = AccountAPI;

        //forgot password
        $scope.OnForgotPassword = function() {
            $scope.LoginError = null;
            $scope.LoginSubmitting = false;
            $scope.LoginErrorMessage = null;

            if($scope.Login.email.trim().length < 1)
            {
                $scope.LoginError = { "email" : "Enter your account-email so we can send you a password reset link."};
            }
            else
            {
                $scope.LoginError = { "email" : "We have sent you a password reset link."};
            }
        };

        //registration ---------------------------------------------
        $scope.Registration = {
            "account" : {
                "name" : "",
                "phone" : "",
                "email" : "",
                "password" : "",
            },
            "name" : "",
            "website" : "",
            "description" : ""
        };
        $scope.RegistrationError = null;
        $scope.RegistrationSubmitting = false;
        $scope.RegistrationErrorMessage = null;
        $scope.ShowRegistrationErrorMessage = function(message) {
            $scope.RegistrationErrorMessage = message;
        };
        $scope.SubmitRegistration = function() {
            $scope.ErrorMessage  = null;
            $scope.RegistrationError = null;
            $scope.RegistrationSubmitting = true;
            $scope.RegistrationErrorMessage = null;

            var config = {
                method: 'POST',
                url: '/rogue/register_employer.php',
                data: $scope.Registration
            };

            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowRegistrationErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.RegistrationError =  data.result.errors;
                        $scope.ShowRegistrationErrorMessage('Your registration had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        AccountAPI.Account = data.result.account;
                        EmployerAPI.Employer = data.result.employer;

                        $scope.Redirect();
                    }
                }
                $scope.RegistrationSubmitting = false;

            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.RegistrationSubmitting = false;
                $scope.ShowRegistrationErrorMessage('We could not process your registration. Please try again later.');
            });
        };
        //login ---------------------------------------------
        $scope.Login = {
            "email" : "",
            "password" : ""
        }
        $scope.LoginError = null;
        $scope.LoginSubmitting = false;
        $scope.LoginErrorMessage = null;
        $scope.ShowLoginErrorMessage = function(message) {
            $scope.LoginErrorMessage = message;
        };
        $scope.SubmitLogin = function() {
            $scope.LoginError = null;
            $scope.LoginSubmitting = false;
            $scope.LoginErrorMessage = null;

            var config = {
                method: 'POST',
                url: '/rogue/login_employer.php',
                data: $scope.Login
            };
            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowLoginErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.LoginError =  data.result.errors;
                        $scope.ShowLoginErrorMessage('Your login had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        AccountAPI.Account = data.result.account;
                        EmployerAPI.Employer = data.result.employer;

                        $scope.Redirect();
                    }
                }
                $scope.LoginSubmitting = false;
            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.LoginSubmitting = false;
                $scope.ShowLoginErrorMessage('We could not process your login. Please try again later.');
            });            
        };
        $scope.Redirect = function() {
            if($routeParams.next === 'post')
            {
                $location.path('/jobpost');
            }
            else
            {
                $location.path('/employer/dashboard');
            }
        };


    }] );

    app.controller('JobPostViewCtrl', ['$scope', function($scope){
        
    }])

    app.controller('JobSeekerRegistrationController', 
        ['$scope', '$http', '$location', 'StaticAPI', 'AccountAPI', 'JobSeekerAPI', 
        function($scope, $http, $location, StaticAPI, AccountAPI, JobSeekerAPI) {

        var that = $scope;

        $scope.StaticAPI = StaticAPI;
        $scope.JobSeekerAPI = JobSeekerAPI;
        $scope.AccountAPI = AccountAPI;

        //forgot password
        $scope.OnForgotPassword = function() {
            $scope.LoginError = null;
            $scope.LoginSubmitting = false;
            $scope.LoginErrorMessage = null;

            if($scope.Login.email.trim().length < 1)
            {
                $scope.LoginError = { "email" : "Enter your account-email so we can send you a password reset link."};
            }
            else
            {
                $scope.LoginError = { "email" : "We have sent you a password reset link."};
            }
        };

        $scope.Registration = {
            location : {
                name: '',
                lat: 0,
                lon: 0
            },
            account : {
                name : "",
                phone : "",
                email : "",
                password : "",
            },
            distance : "",
            resume : "",
            availability : $scope.StaticAPI.GetFullAvailability(),
            jobtypes : [],
            jobfunctions : []
        };

        $scope.RegistrationError = null;
        $scope.RegistrationSubmitting = false;
        $scope.RegistrationErrorMessage = null;
        $scope.ShowRegistrationErrorMessage = function(message) {
            $scope.RegistrationErrorMessage = message;
        };

        $scope.SubmitRegistration = function() {
            $scope.ErrorMessage  = null;
            $scope.RegistrationError = null;
            $scope.RegistrationSubmitting = true;
            $scope.RegistrationErrorMessage = null;

            var config = {
                method: 'POST',
                url: '/rogue/register_jobseeker.php',
                data: $scope.Registration
            };

            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowRegistrationErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.RegistrationError =  data.result.errors;
                        $scope.ShowRegistrationErrorMessage('Your registration had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        AccountAPI.Account = data.result.account;
                        JobSeekerAPI.Employee = data.result.employee;

                        $scope.Redirect();
                    }
                }
                $scope.RegistrationSubmitting = false;

            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.RegistrationSubmitting = false;
                $scope.ShowRegistrationErrorMessage('We could not process your registration. Please try again later.');
            });
        };
        //login ---------------------------------------------
        $scope.Login = {
            "email" : "",
            "password" : ""
        }
        $scope.LoginError = null;
        $scope.LoginSubmitting = false;
        $scope.LoginErrorMessage = null;
        $scope.ShowLoginErrorMessage = function(message) {
            $scope.LoginErrorMessage = message;
        };
        $scope.SubmitLogin = function() {
            $scope.LoginError = null;
            $scope.LoginSubmitting = false;
            $scope.LoginErrorMessage = null;

            var config = {
                method: 'POST',
                url: '/rogue/login_jobseeker.php',
                data: $scope.Login
            };
            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowLoginErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.LoginError =  data.result.errors;
                        $scope.ShowLoginErrorMessage('Your login had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        AccountAPI.Account = data.result.account;
                        JobSeekerAPI.Employee = data.result.employee;

                        $scope.Redirect();
                    }
                }
                $scope.LoginSubmitting = false;
            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.LoginSubmitting = false;
                $scope.ShowLoginErrorMessage('We could not process your login. Please try again later.');
            });            
        };
        $scope.Redirect = function() {
            $location.path('/jobseeker/dashboard');
        };

        $scope.LoadingLocationMessage = null;
        $scope.GetLocation = function() {
            $scope.GettingLocation = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.OnGotLocationSuccess, $scope.OnGotLocationError, { timeout: 3000 });
                setTimeout(function(){
                    if($scope.LoadingLocationMessage) {
                        $scope.OnGotLocationError();
                }}, 4000);
                $scope.LoadingLocationMessage = 'Loading...';
            }
            else
            {
                $scope.LoadingLocationMessage = 'Please enter your postal code - your location is not available.';
            }
        }

        $scope.OnGotLocationError = function(error) {
            $scope.$apply(function() {
                that.GettingLocation = false;
                that.LoadingLocationMessage = 'Please enter your postal code - your location is not available.';
            });
        };

        $scope.OnGotLocationSuccess = function(position) {
            $scope.$apply(function() {
                that.LoadingLocationMessage = null;
                that.Registration.location.name = 'Current';
                that.Registration.location.lat = position.coords.latitude;
                that.Registration.location.lon = position.coords.longitude;
            });
        };
    }]);

    app.controller('JobPostCandidateSeekerController', 
        ['$scope', 'StaticAPI', 'AccountAPI', 'JobSeekerAPI', 
        function($scope, StaticAPI, AccountAPI, JobSeekerAPI) {
    }]);

})();