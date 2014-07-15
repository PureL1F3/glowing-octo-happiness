// Assumption - using 4 hour blocks to represent time [6-10AM, 10AM-2PM, 2-6PM, 6-10PM, 10PM-2AM, 2-6AM]

(function() {
    var app = angular.module('rogue', ['ui.bootstrap', 'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'partials/jobsearch-home.html',
            controller : 'JobSearchHomeCtrl'
        }).when('/account', {
            templateUrl : 'partials/account-picker.html',
            controller : 'AccountPickerCtrl'
        }).when('/employer/dashboard/:page', {
            templateUrl : 'partials/employer-posted.html',
            controller : 'EmployerDashboardCtrl'
        }).when('/employer/job/:jobid/candidates/:type/:page', {
            templateUrl : 'partials/jobpost-candidates.html',
            controller : 'EmployerJobCandidatesCtrl'
        }).when('/jobseeker/dashboard/:page', {
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
        }).when('/registration/employer', {
            templateUrl : 'partials/registration-employer.html',
            controller : 'EmployerRegistrationController'
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

    app.controller('NavCtrl', ['$scope', function($scope){
        $scope.CurrentView = 'findjobs';
        $scope.ShowFindJobs = true;
        $scope.ShowAccount = true;
        $scope.ShowLogout = true;

        $scope.SetCurrentView = function(view)
        {
            $scope.CurrentView = view;
        }


        function OnAccount = function() {

        };
        
        function OnLogout = function() {

        };
    }])

    app.controller('JobSeekerDashboardCtrl', ['$scope', function($scope){
        
    }])

    app.controller('AccountPickerCtrl', ['$scope', '$location', function($scope, $location){
        $scope.OnJobSeekerAccount = function()
        {
            $location.path('/registration/jobseeker');
        };

        $scope.OnEmployerAccount = function() {
            $location.path('/registration/employer');
        };
    }])

    app.controller('EmployerJobCandidatesCtrl', ['$scope', '$http', '$location', '$routeParams', '$anchorScroll', '$window', 'StaticAPI', 
        function($scope, $http, $location, $routeParams, $anchorScroll, $window, StaticAPI){
        $scope.StaticAPI = StaticAPI;
        $scope.Load = function()
        {
            var config = {
                method: 'POST',
                url: '/rogue/get_candidates.php',
                data: {
                    jobid : $scope.JobId,
                    candidate_type : $scope.CandidateType,
                    page : $scope.Page
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
                    $scope.start = data.result.start;
                    $scope.end = data.result.end;
                    $scope.total = data.result.total;

                    //scroll to top of page
                    $location.hash('top');
                    $anchorScroll();
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to load: " + status);
            });
        };            

        $scope.Job = {};
        $scope.Candidates = {};

        $scope.start = 0;
        $scope.end = 0;
        $scope.total = 0;

        $scope.IsCandidates = function(type)
        {
            return $scope.Candidates.type === type;
        }

        $scope.getTimes=function(n){
            return new Array(n);
        };

        $scope.OnBackToPostedJobs = function() {
            $window.history.back();
        };

        $scope.OnViewCandidates = function(id, type){
            if(type === 'new')
            {
                $scope.JobId = id;
                $scope.CandidateType = 'New';
                $scope.Page = 1;
                $scope.Load();
            }
            else if(type === 'yes')
            {
                $scope.JobId = id;
                $scope.CandidateType = 'Yes';
                $scope.Page = 1;
                $scope.Load();
            }
            else if(type === 'no')
            {
                $scope.JobId = id;
                $scope.CandidateType = 'No';
                $scope.Page = 1;
                $scope.Load();
            }
            else if(type === 'matches')
            {
                $location.path('/employer/job/' + id + '/matches');
            }
        };

        $scope.DoesJobPostExpireInMoreThanSeven = function(expire_days) {
            return expire_days >= 7;
        }

        $scope.OnEditPost = function(id) {
            $location.path('/employer/job/' + id + '/edit');
        };

        $scope.OnRemovePost = function(id) {
            var config = {
                method: 'POST',
                url: '/rogue/remove_post.php',
                data: {
                    jobid : id
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to remove post: " + data.result);
                }
                else
                {
                    console.log("SUCCESS - removed post");
                    $scope.Job.expire_days = 0;
                    $scope.Job.expired = true;
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to removed post: " + status);
            });
        };

        $scope.OnExtendPost = function(id) {
            var config = {
                method: 'POST',
                url: '/rogue/extend_post.php',
                data: {
                    jobid : id
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to extend post: " + data.result);
                }
                else
                {
                    if(data.result.error)
                    {
                        console.log("SUCCESS - extend post - error");
                    }
                    else
                    {
                        $scope.Job.expire_days = data.result.expiry_days;
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to extend post: " + status);
            });
        };

        $scope.OnModifyCandidate = function(jobid, id, mod) {
            if(mod == 'yes')
            {
            }
            else if(mod == 'no')
            {

            }
            else
            {
                return;
            }

            var config = {
                method: 'POST',
                url: '/rogue/mod_candidate.php',
                data: {
                    jobid : jobid,
                    applicationid : id,
                    state : mod
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to modify candidate: " + data.result);
                    //remove candidate from ui 
                    for(var i = 0; i < $scope.Candidates.profiles.length; i++)
                    {
                        if($scope.Candidates.profiles[i].id === id)
                        {
                            $scope.Candidates.profiles.splice(i, 1);
                        }
                    }
                }
                else
                {
                    console.log("SUCCESS - modified candidate");
                    $scope.Job.expire_days = data.result.expiry_days;
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to modify candidate: " + status);
            });
        }

        //pagination
        $scope.OnNextPage = function() {
            $scope.Page++;
            $scope.Load();
        };
        $scope.OnPrevPage = function() {
            $scope.Page--;
            $scope.Load();
        };

        $scope.Initialize = function() {
            $scope.JobId = parseInt($routeParams.jobid);
            $scope.CandidateType = $routeParams.type;
            $scope.Page = parseInt($routeParams.page);
        }

        $scope.Initialize();
        $scope.Load();
    }]);

    app.controller('EmployerDashboardCtrl', ['$scope', '$http', '$location', '$anchorScroll', '$routeParams', 'StaticAPI', 
        function($scope, $http, $location, $anchorScroll, $routeParams, StaticAPI){
        $scope.StaticAPI = StaticAPI;
        $scope.Page = 1;

        $scope.OnPostJob = function() {
            $location.path('/jobpost');
        };

        $scope.Load = function()
        {
            var config = {
                method: 'POST',
                url: '/rogue/get_jobposts.php',
                data: {
                    page : $scope.Page
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
                    $scope.PostedJobs = data.result;

                    //scroll to top of page
                    $location.hash('top');
                    $anchorScroll();
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to load: " + status);
            });
        };   

        $scope.PostedJobs = {};

        $scope.OnEditPost = function(id) {
            $location.path('/employer/job/' + id + '/edit');
        };

        $scope.OnRemovePost = function(id) {
            var config = {
                method: 'POST',
                url: '/rogue/remove_post.php',
                data: {
                    jobid : id
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to remove post: " + data.result);
                }
                else
                {
                    console.log("SUCCESS - removed post");
                    for(var i = 0; i < $scope.PostedJobs.jobs.length; i++)
                    {
                        if($scope.PostedJobs.jobs[i].id == id)
                        {
                            $scope.PostedJobs.jobs[i].expire_days = 0;
                            $scope.PostedJobs.jobs[i].expired = true;
                            break;
                        }
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to removed post: " + status);
            });
        };

        $scope.OnExtendPost = function(id) {
            var config = {
                method: 'POST',
                url: '/rogue/extend_post.php',
                data: {
                    jobid : id
                }
            };
            console.log(config);
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    console.log("SUCCESS - Failed to extend post: " + data.result);
                }
                else
                {
                    if(data.result.error)
                    {
                        console.log("SUCCESS - extend post - error");
                    }
                    else
                    {
                        for(var i = 0; i < $scope.PostedJobs.jobs.length; i++)
                        {
                            if($scope.PostedJobs.jobs[i].id == id)
                            {
                                $scope.PostedJobs.jobs[i].expire_days = data.result.expiry_days;
                                break;
                            }
                        }
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log("ERROR - Failed to extend post: " + status);
            });
        };

        $scope.OnViewCandidates = function(id, type){
            if(type === 'new')
            {
                $location.path('/employer/job/' + id + '/candidates/New/1');
            }
            else if(type === 'yes')
            {
                $location.path('/employer/job/' + id + '/candidates/Yes/1');
            }
            else if(type === 'no')
            {
                $location.path('/employer/job/' + id + '/candidates/No/1');
            }
            else if(type === 'matches')
            {
                $location.path('/employer/job/' + id + '/matches');
            }
        };

        $scope.Initialize = function()
        {
            $scope.Page = parseInt($routeParams.page);
        }

        $scope.DoesJobPostExpireInMoreThanSeven = function(expire_days) {
            return expire_days >= 7;
        }

        //pagination
        $scope.OnNextPage = function() {
            $scope.Page++;
            $scope.Load();
        };
        $scope.OnPrevPage = function() {
            $scope.Page--;
            $scope.Load();
        };

        $scope.Initialize();
        $scope.Load();
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

    app.controller('JobPostCreateCtrl', ['StaticAPI', 'EmployerAPI', '$scope', '$http', '$location', 
        function(StaticAPI, EmployerAPI, $scope, $http, $location) {
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
                        $location.path('/employer/dashboard/1');
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
                $location.path('/employer/dashboard/1');
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
            $location.path('/jobseeker/dashboard/1');
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