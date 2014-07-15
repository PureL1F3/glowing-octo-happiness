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
        }).when('/employer/job/:jobid/candidates/:type/:page', {
            templateUrl : 'partials/jobpost-candidates.html',
            controller : 'EmployerJobCandidatesCtrl'
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

    app.controller('EmployerJobCandidatesCtrl', ['$scope', '$http', 'StaticAPI', function($scope, $http, StaticAPI){
        $scope.StaticAPI = StaticAPI;
        $scope.Load = function(jobid, candidate_type, page)
        {
            var config = {
                method: 'GET',
                url: '/rogue/get_candidates.php',
                data: {
                    jobid : jobid,
                    candidate_type : candidate_type,
                    page : page
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to load: " + data.result);
                }
                else
                {
                    console.log("SUCCESS - Loaded");
                    $scope.Job = data.result.job;
                    $scope.Candidates = data.result.candidates;
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to load: " + status);
            });
        };            

        $scope.Job = {
            id : 1,
            title : 'job title',
            employer : 'employer',
            posted_days : 0,
            expire_days : 1,
            candidates : {
                'new' : 100,
                yes : 10,
                no : 5,
                matches : 50
            },
            job_hours : 10
        };

        $scope.Candidates = {
            type : 'New',
            start : 1,
            end : 5,
            total : 50,
            profiles : [{
                id : 10,
                name : 'Anna Vassilovski',
                email : 'anna@mail.com',
                phone : '+416-239-0890',
                application_days : 0,
                job_hours_match : 5,
                job_hours_match_solid : 2,
                job_hours_match_empty : 2,
                availability : StaticAPI.GetFullAvailability(),
                resume : 'omgggg some stuff'
                }]
        };

        $scope.IsCandidates = function(type)
        {
            return $scope.Candidates.type === type;
        }

        $scope.getTimes=function(n){
            return new Array(n);
        };

        $scope.OnBackToPostedJobs = function() {

        };

        $scope.OnViewCandidates = function(id, type){
            if(type === 'new')
            {

            }
            else if(type === 'yes')
            {

            }
            else if(type === 'no')
            {

            }
            else if(type === 'matches')
            {

            }
        };

        $scope.OnEditPost = function(id) {
        };

        $scope.OnRemovePost = function(id) {

        };

        $scope.OnExtendPost = function(id) {

        };

        $scope.OnModifyCandidate = function(id, mod) {
            if(mod == 'yes')
            {

            }
            else if(mod == 'no')
            {

            }
        }

        $scope.OnNextPage = function() {

        };

        $scope.OnPrevPage = function() {

        };
    }]);

    app.controller('EmployerDashboardCtrl', ['$scope', function($scope){

        $scope.PostedJobs = {
            start : 1,
            end : 5,
            total : 10,
            jobs : [
            {
                id : 1,
                title : 'job title',
                employer : 'employer',
                posted_days : 0,
                expire_days : 1,
                candidates : {
                    'new' : 100,
                    yes : 10,
                    no : 5,
                    matches : 50
                },
                job_hours : 10
            }]
        };

        $scope.OnEditPost = function(id) {
        };

        $scope.OnRemovePost = function(id) {

        };

        $scope.OnExtendPost = function(id) {

        };


        $scope.OnViewCandidates = function(id, type){
            if(type === 'new')
            {

            }
            else if(type === 'yes')
            {

            }
            else if(type === 'no')
            {

            }
            else if(type === 'matches')
            {

            }
        };
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
            };
            return params;
        };

        this.GetSearchParams = function() {
            return angular.copy(this.SearchParams);
        };

        this.SetSearchParams = function(params) {
            this.SearchParams = angular.copy(params);
        };

        this.NoResults = function() {
            return this.SearchResults.total === 0;
        };

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

    app.controller('JobPostViewCtrl', 
        ['StaticAPI', '$scope', '$window', '$http', 
        function(StaticAPI, $scope, $window, $http){
        $scope.StaticAPI = StaticAPI;
        
        $scope.Job = {
            id : 1,
            title : 'bar server',
            employer : 'keg',
            description : 'this is some shit\n\nttell me more',
            externalurl : '',
            postdays : 4,
            postdate : null,
            total_hours : null,
            match_hours : null,
            availability_hours : null,
            //job hours match
            job_hours_match : false,
            job_hours_match_solid : 3,
            job_hours_match_empty : 1,
            //availability stars
            availability_match : false,
            availability_match_solid : 0,
            availability_match_empty : 4,
            //show applied
            applied : false
        };

        $scope.getTimes=function(n){
            return new Array(n);
        };


        $scope.Application = {
            jobid : $scope.Job.id,
            name : '',
            email : '',
            phone : '',
            resume : '',
            availability : StaticAPI.GetFullAvailability(),
            availability_hours : null
        };

        $scope.ApplicationError = null;
        $scope.ApplicationErrorMessage = null;
        $scope.ApplicationSubmitting = false;


                // There were some errors with your registration. Please check the form and try again.

        $scope.ShowApplication = false;
        $scope.ShowApplicationSuccess = false;

        $scope.ToggleSave = function() {
            alert("saved it!");
        };

        $scope.OnEmail = function() {
            alert("e-mail it!");
        }

        $scope.OnApply = function() {
            if($scope.Job.externalurl || $scope.Job.externalurl.length > 0)
            {
                $window.open($scope.Job.externalurl);
            }
            else
            {
                $scope.ShowApplication = true;
            }
        };

        $scope.ShowApplicationErrorMessage = function(msg)
        {
            $scope.ApplicationErrorMessage = msg;
        }

        $scope.OnSubmitApplication = function() {

            $scope.ApplicationError = null;
            $scope.ApplicationErrorMessage = null;
            $scope.ApplicationSubmitting = true;
            
            var config = {
                method: 'POST',
                url: '/rogue/submit_jobapplication.php',
                data: $scope.Application
            };
            console.log(config);

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok)
                {
                    $scope.ShowApplicationErrorMessage(data.result);
                }
                else
                {
                    if(data.result.errors)
                    {
                        $scope.ApplicationError =  data.result.errors;
                        $scope.ShowApplicationErrorMessage('Your application had some problem(s). Please check and resubmit.');
                    }
                    else
                    {
                        $scope.Job.applied = true;
                        $scope.ShowApplication = false;
                        $scope.ShowApplicationSuccess = true;
                    }
                }
                $scope.ApplicationSubmitting = false;
            });
            $promise.error(function(data, status, headers, config) {
                console.log(data);
                $scope.ApplicationSubmitting = false;
                $scope.ShowApplicationErrorMessage('We could not process your application. Please try again later.');
            });            
        };
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