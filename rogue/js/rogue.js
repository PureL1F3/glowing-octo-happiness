// Assumption - using 4 hour blocks to represent time [6-10AM, 10AM-2PM, 2-6PM, 6-10PM, 10PM-2AM, 2-6AM]

(function() {
    var app = angular.module('rogue', ['ui.bootstrap', 'ngRoute', 'ngCookies', 'ngAnimate']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'partials/jobsearch-home.html',
            controller : 'JobSearchHomeCtrl'
        }).when('/account', {
            templateUrl : 'partials/account-picker.html',
            controller : 'AccountPickerCtrl'
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
        }).when('/registration/employer', {
            templateUrl : 'partials/registration-employer.html',
            controller : 'EmployerRegistrationController'
        }).when('/registration/jobseeker', {
            templateUrl : 'partials/registration-employee.html',
            controller : 'JobSeekerRegistrationController'
        }).otherwise({
            redirectTo : '/'
        });
    }]);

    app.controller('NavCtrl', ['$scope', '$location', 'AccountAPI', function($scope, $location, AccountAPI){
        $scope.CurrentNav = '';
        $scope.ShowFindJobs = false;
        $scope.ShowAccount = false;
        $scope.ShowLogout = false;

        $scope.UpdateNav = function() {
            console.log('updating nav with account');
            console.log(AccountAPI.Account);
            if(!AccountAPI.Account) {
                $scope.LoadNav(null);
            }
            else if(AccountAPI.Account.employer) {
                $scope.LoadNav('employer');
            }
            else if(AccountAPI.Account.jobseeker) {
                $scope.LoadNav('jobseeker');
            }
        };

        $scope.LoadNav = function(type) {
            if($scope.CurrentNav === type) {
                return;
            }
            $scope.CurrentNav = type;
            $scope.ShowFindJobs = type != 'employer';
            $scope.ShowAccount = true;
            $scope.ShowLogout = type != null;
        };

        $scope.OnAccount = function() {
            console.log(AccountAPI.Account);

            if(!AccountAPI.Account) {
                $location.path('/account');
            }
            else if(AccountAPI.Account.employer) {
                $location.path('/employer/dashboard');
            }
            else if(AccountAPI.Account.jobseeker) {
                $location.path('/jobseeker/dashboard');
            }
        };
        
        $scope.OnLogout = function() {
            AccountAPI.Logout();
            $location.path('/');
        };


        AccountAPI.deffered.promise.then(function() {
            $scope.UpdateNav();
        });
        AccountAPI.registerObserverCallback($scope.UpdateNav);
    }])

    app.controller('AccountPickerCtrl', ['$scope', '$location', 'AccountAPI', 'StreamHireAPI', function($scope, $location, AccountAPI, StreamHireAPI){
        $scope.OnJobSeekerAccount = function()
        {
            $location.path('/registration/jobseeker');
        };

        $scope.OnEmployerAccount = function() {
            $location.path('/registration/employer');
        };

        AccountAPI.deffered.promise.then(function() {
            if(AccountAPI.Account)
            {
                if(AccountAPI.Account.employer){
                    StreamHireAPI.BumpHome('employer');

                } else if(AccountAPI.Account.jobseeker) {
                    StreamHireAPI.BumpHome('jobseeker');
                }
            }
        });
    }]);

    app.controller('EmployerJobCandidatesCtrl', ['$scope', '$http', '$location', '$routeParams', '$anchorScroll', '$window', 'StaticAPI' , 
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

    app.controller('EmployerDashboardCtrl', ['$scope', '$location', '$anchorScroll', 'StaticAPI', 'StreamHireAPI','AccountAPI',
        function($scope, $location, $anchorScroll, StaticAPI, StreamHireAPI, AccountAPI){
        
        $scope.ScrollToTop = function() {
            $location.hash('top');
            $anchorScroll();
        };
        $scope.UpdateJobpostExpiry = function(id, expired, expiry_days) {
            for(var i = 0; i < $scope.PostedJobs.jobs.length; i++) {
                if($scope.PostedJobs.jobs[i].id == id) {
                    $scope.PostedJobs.jobs[i].expire_days = expiry_days;
                    $scope.PostedJobs.jobs[i].expired = expired;
                    break;
                }
            }   
        };
        $scope.Load = function() {
            var OnLoadSuccess = function(postedjobs) {
                $scope.Loading = false;
                $scope.PostedJobs = postedjobs;
                $scope.ScrollToTop();
            };
            var OnLoadError = function(error) {
                if(error === "NOT_AUTH") {
                    StreamHireAPI.BumpToLogin('employer', true);
                }
                else 
                $scope.Loading = false;
                console.log("Failed to load page" + error);
            };
            $scope.Loading = true;
            StreamHireAPI.GetEmployerJobPosts($scope.Page, OnLoadSuccess, OnLoadError)
        }
        $scope.OnPostJob = function() {
            $location.path('/jobpost');
        };
        $scope.OnExtendPost = function(id) {
            var OnExtendSuccess = function(data){
                $scope.UpdateJobpostExpiry(id, data.expired, data.expiry_days);
                $scope.PostedJobExtending[id] = false;
            };
            var OnExtendError = function(error) {
                if(error.type && error.type === "INVALID_EXTENDPOST_EXPIRED") {
                    $scope.UpdateJobpostExpiry(id, error.data.expired, error.data.expiry_days);
                    $scope.PostedJobModifyErrors[id] = 'Sorry, this jobpost is already expired.';
                }
                else if(error.type && error.type === "INVALID_EXTENDPOST_TOOEARLY") {
                    $scope.UpdateJobpostExpiry(id, error.data.expired, error.data.expiry_days);
                    $scope.PostedJobModifyErrors[id] = 'Sorry, you can only extend the post in the last 7 days.';
                }
                else if(error === "NOT_AUTH") {
                    StreamHireAPI.BumpToLogin('employer', true);
                }
                else {
                    $scope.PostedJobModifyErrors[id] = 'Sorry, failed to extend post. Please try again later.';
                }
                $scope.PostedJobExtending[id] = false;
            };
            delete $scope.PostedJobModifyErrors[id];
            $scope.PostedJobExtending[id] = true;
            StreamHireAPI.ExtendEmployerJobPost(id, OnExtendSuccess, OnExtendError);
        };
        $scope.OnRemovePost = function(id) {
            var OnRemoveSuccess = function(data){
                $scope.UpdateJobpostExpiry(id, data.expired, data.expire_days);
                $scope.PostedJobRemoving[id] = false;
            };
            var OnRemoveError = function() {
                if(error === "NOT_AUTH") {
                    StreamHireAPI.BumpToLogin('employer', true);
                }
                else {
                    $scope.PostedJobModifyErrors[id] = "Sorry, failed to expire post. Please try again later.";
                }
                $scope.PostedJobRemoving[id] = false;
            };

            delete $scope.PostedJobModifyErrors[id];
            $scope.PostedJobRemoving[id] = true;
            StreamHireAPI.RemoveEmployerJobPost(id, onRemoveSuccess, onRemoveError);
        };
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
        $scope.OnViewCandidates = function(id, type){
            if(type === 'New' || type === 'Yes' || type === 'No')
            {
                $location.path('/employer/job/' + id + "?type=" + type + "&page=1");
            }
            else if(type === 'matches')
            {
                $location.path('/employer/job/' + id + '/matches');
            }
        };

        AccountAPI.deffered.promise.then(function() {
            if(!(AccountAPI.Account && AccountAPI.Account.employer)){
                StreamHireAPI.BumpHome();
            }
        });
        //------------------UI for loading job post
        $scope.Loading = false;
        $scope.LoadingErrorMessage = null;

        //------------------UI for extending/removing job post
        $scope.PostedJobModifyErrors = {};
        $scope.PostedJobExtending = {};
        $scope.PostedJobRemoving = {};

        $scope.StaticAPI = StaticAPI;
        $scope.Page = 1;

        $scope.PostedJobs = {};
        $scope.Load();
    }]);

    app.controller('JobSearchHomeCtrl', ['SearchAPI', 'StaticAPI', 'LocationAPI', 'StreamHireAPI', '$scope', '$location', '$http', function(SearchAPI, StaticAPI, LocationAPI, StreamHireAPI, $scope, $location, $http){
        $scope.StaticAPI = StaticAPI;
        var that = this;
        $scope.DoSearch = function() {
            SearchAPI.SetSearchParams($scope.SearchParams);
            $location.path('/jobresults');
        };
        $scope.OnSearch = function() {
            //check if already have location
            //else get location
            //final thing is check that we are down!

            $scope.SearchParams.location.name = $scope.SearchParams.location.name.replace(/[^a-z0-9]/gi,'');
            $scope.SearchErrors = null;

            
            var location_len = $scope.SearchParams.location.name.length;
            if(location_len < 1)
            {
                $scope.ShowSearchError('location', 'Please enter your postal code');  
            }
            else if(!($scope.SearchParams.location.lat && $scope.SearchParams.location.lon))
            {
                var OnLocationSuccess = function(code, lat, lon) {
                    $scope.SearchParams.location.name = code;
                    $scope.SearchParams.location.lat = lat;
                    $scope.SearchParams.location.lon = lon;
                    if(!SearchAPI.IsAvailabilityValid($scope.SearchParams.availability)) {
                        $scope.ShowSearchError('availability', 'Please select your availability');
                    }
                    else
                    {
                        $scope.DoSearch();
                    }
                }
                StreamHireAPI.GetLocation($scope.SearchParams.location.name, OnLocationSuccess);
            }
            else
            {
                if(!SearchAPI.IsAvailabilityValid($scope.SearchParams.availability)) {
                    $scope.ShowSearchError('availability', 'Please select your availability');
                }
                else
                {
                    $scope.DoSearch();
                }
            }
        };
        $scope.OnPostJob = function() {
            $location.path('/jobpost');
        };
        $scope.ShowSearchError = function(key, error) {
            if(!$scope.SearchErrors) {
                $scope.SearchErrors = {};
            }
            $scope.SearchErrors[key] = error;
        };

        $scope.SearchErrors = null; 
        $scope.SearchParams = SearchAPI.GetSearchParams();

        $scope.LocationAvailable = true;
        $scope.GettingLocation = false;
        $scope.LoadingLocationMessage = null;

        $scope.DisableLocation = function() {
            $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
            $scope.GettingLocation = false;
            $scope.LocationAvailable = false;
        };

        $scope.OnGetLocation = function() {
            var msgLocationUnavailable = 'Sorry location is unavailable - please enter a postal code.';
            var OnGetLocationSuccess = function(position) {
                $scope.$apply(function() {
                    $scope.GettingLocation = false;
                    $scope.LoadingLocationMessage = null;
                    $scope.SearchParams.location.name = 'Current';
                    $scope.SearchParamsLocationLatLonName = $scope.SearchParams.location.name;
                    $scope.SearchParams.location.lat = position.coords.latitude;
                    $scope.SearchParams.location.lon = position.coords.longitude;
                });
            };
            var OnGetLocationError = function(error) {
                $scope.$apply(function(){
                    $scope.GettingLocation = false;
                    $scope.DisableLocation();
                });
            };
            $scope.GettingLocation = true;
            $scope.LoadingLocationMessage = 'Loading location...';
            LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
            setTimeout(function(){
                    if($scope.GettingLocation) {
                        $scope.OnGotLocationError();
                }}, 3500);
        };
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


        //load results
        $scope.Load = function() {
            var OnLoadSuccess = function(postedjobs) {
                $scope.Loading = false;
                $scope.PostedJobs = postedjobs;
                $scope.ScrollToTop();
            };
            var OnLoadError = function(error) {
                if(error === "NOT_AUTH") {
                    StreamHireAPI.BumpToLogin('employer', true);
                }
                else 
                $scope.Loading = false;
                console.log("Failed to load page" + error);
            };
            $scope.Loading = true;
            StreamHireAPI.GetEmployerJobPosts($scope.Page, OnLoadSuccess, OnLoadError)
        }


        //pagination -------------------------------------------------
        $scope.Page = 1;
        $scope.OnNextPage = function() {
            $scope.Page++;
            $scope.Load();
        };
        $scope.OnPrevPage = function() {
            $scope.Page--;
            $scope.Load();
        };
        //location ---------------------------------------------------
        $scope.LocationAvailable = true;
        $scope.GettingLocation = false;
        $scope.LoadingLocationMessage = null;
        $scope.DisableLocation = function() {
            $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
            $scope.GettingLocation = false;
            $scope.LocationAvailable = false;
        };
        $scope.OnGetLocation = function() {
            var msgLocationUnavailable = 'Sorry location is unavailable - please enter a postal code.';
            var OnGetLocationSuccess = function(position) {
                $scope.$apply(function() {
                    $scope.GettingLocation = false;
                    $scope.LoadingLocationMessage = null;
                    $scope.SearchParams.location.name = 'Current';
                    $scope.SearchParamsLocationLatLonName = $scope.SearchParams.location.name;
                    $scope.SearchParams.location.lat = position.coords.latitude;
                    $scope.SearchParams.location.lon = position.coords.longitude;
                });
            };
            var OnGetLocationError = function(error) {
                $scope.$apply(function(){
                    $scope.GettingLocation = false;
                    $scope.DisableLocation();
                });
            };
            $scope.GettingLocation = true;
            $scope.LoadingLocationMessage = 'Loading location...';
            LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
            setTimeout(function(){
                    if($scope.GettingLocation) {
                        $scope.OnGotLocationError();
                }}, 3500);
        };
    }]);

    app.controller('JobPostCreateCtrl', ['StaticAPI', '$scope', '$location', '$routeParams', 'AccountAPI', 'StreamHireAPI', 'LocationAPI', function(StaticAPI, $scope, $location, $routeParams, AccountAPI, StreamHireAPI, LocationAPI) {    
        $scope.DisableLocation = function() {
            $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
            $scope.GettingLocation = false;
            $scope.LocationAvailable = false;
        };
        $scope.GetLocation = function() {
            var OnGetLocationSuccess = function(position) {
                $scope.$apply(function() {
                    $scope.GettingLocation = false;
                    $scope.LoadingLocationMessage = null;
                    $scope.Jobpost.location.name = 'Current';
                    $scope.Jobpost.location.lat = position.coords.latitude;
                    $scope.Jobpost.location.lon = position.coords.longitude;
                });
            };
            var OnGetLocationError = function(error) {
                $scope.$apply(function() {
                    $scope.DisableLocation();
                });
            };
            $scope.GettingLocation = true;
            $scope.LoadingLocationMessage = 'Loading location...';
            LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
            setTimeout(function(){
                    if($scope.GettingLocation) {
                        OnGetLocationError();
                }}, 3500);
        };
        $scope.SubmitJobPost = function() {
            var OnSubmitJobPostSuccess = function() {
                $scope.FormSubmitting = false;
                $location.path('/employer/dashboard')
            };
            var OnSubmitJobPostError = function(errors, errorMsg) {
                $scope.FormSubmitting = false;
                $scope.FormErrorMessage = errorMsg;
                $scope.FormError = errors;
            };
            $scope.FormSubmitting = true;
            $scope.FormErrorMessage = null;
            $scope.FormError = null;
            
            StreamHireAPI.SendJobPost($scope.Jobpost, OnSubmitJobPostSuccess, OnSubmitJobPostError);
        };

        AccountAPI.deffered.promise.then(function() {
            if(!AccountAPI.Account) {
                StreamHireAPI.BumpToLogin('employer', true);
            }
            else if(AccountAPI.Account.jobseeker) {
                StreamHireAPI.BumpHome();
            }
        });

        //initialization
        $scope.StaticAPI = StaticAPI;
        $scope.FormError = null;
        $scope.FormErrorMessage = null;
        $scope.FormSubmitting = false;
        $scope.Jobpost = {
            location : {
                name: '',
                lat: null,
                lon: null
            },
            jobfunction : 0,
            jobtype : 0,
            employer : '',
            title : '',
            description : '',
            availability : StaticAPI.GetFullAvailability(),
            applicationtype : false,
            externalurl : ''
        };
        $scope.LocationAvailable = true;
        $scope.GettingLocation = false;
        $scope.LoadingLocationMessage = null;
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
                    lat : null,
                    lon : null
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

        this.AreActionableSearchParams = function(params) {
            if(!(params.location.name.length > 0 && params.location.lat && params.location.lon))
            {
                return false;
            }

            var has_availability = false;
            for(var i = 0; i < StaticAPI.AvailabilityDays.length; i++) {
                for(var j = 0; j < StaticAPI.AvailabilityCategories.length; j++) {
                    if(params.availability && params.availability[i] && params.availability[i][j]) {
                        has_availability = true;
                        break;
                    }
                }
            }
            return has_availability;
        };

        this.IsAvailabilityValid = function(availability) {
            var has_availability = false;
            for(var i = 0; i < StaticAPI.AvailabilityDays.length; i++) {
                for(var j = 0; j < StaticAPI.AvailabilityCategories.length; j++) {
                    if(availability && availability[i] && availability[i][j]) {
                        has_availability = true;
                        break;
                    }
                }
            }
            return has_availability;
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

    app.service('AccountAPI', ['$http', '$cookieStore', '$q', function($http, $cookieStore, $q) { 
        var that = this;
        this.observerCallbacks = [];  
        this.registerObserverCallback = function(callback){
            this.observerCallbacks.push(callback);
        };
        this.notifyObservers = function(){
            angular.forEach(this.observerCallbacks, function(callback){
                callback();
            });
        };

        this.UpdateAccount = function(account) {
            console.log('updated account');
            this.Account = account;
            console.log(account);
            console.log(this.Account);
            this.notifyObservers();
        };

        this.Logout = function() {
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            this.UpdateAccount(null);
        };

        this.Register = function(type, registration, onSuccess, onError) {
            //onSuccess : function()
            //onError : function(errors, msg)
            var msgFailed = 'We could not register you right now. Please try again later.';
            var msgError = 'Your registration had some problem(s). Please check and try again.';

            var config = {
                method: 'POST',
                data : registration,
                url : (type === 'employer' ? '/rogue/register_employer.php' : '/rogue/register_jobseeker.php')
            };

            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log('AccountAPI.Register.success...');
                console.log(data);
                if(!data.ok) {
                    console.log("ISSUES");
                }
                else if(data.result.errors) {
                    if(onError) {
                        onError(data.result.errors, msgError);
                    }
                }
                else {
                    if(onSuccess) {
                        that.UpdateAccount(data.result);
                        onSuccess();
                    }
                }
            });
            promise.error(function(data, status, headers, config) {
                console.log('AccountAPI.Register.error...');
                console.log(status);
                if(onError) {
                    onError(null, msgFailed);
                }
            });
        };
        this.Login = function(type, login, onSuccess, onError) {
            //onSuccess : function()
            //onError : function(errors, msg)
            var msgFailed = 'We could not log you in right now. Please try again later.';
            var msgError = 'Your login had some problem(s). Please check and try again.';

            var config = {
                method: 'POST',
                data : login,
                url : (type === 'employer' ? '/rogue/login_employer.php' : '/rogue/login_jobseeker.php')
            };

            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log('AccountAPI.Login.success...');
                console.log(data);
                if(!data.ok) {
                    console.log("ISSUES");
                }
                else if(data.result.errors) {
                    if(onError) {
                        onError(data.result.errors, msgError);
                    }
                }
                else {
                    if(onSuccess) {
                        that.UpdateAccount(data.result);
                        onSuccess();
                    }
                }
            });
            promise.error(function(data, status, headers, config) {
                console.log('AccountAPI.Login.error...');
                console.log(status);
                if(onError) {
                    onError(null, msgFailed);
                }
            });
        };
        this.Load = function() {
            var config = {
                method: 'GET',
                url : '/rogue/load_account.php'
            };

            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log('AccountAPI.Load.success...');
                console.log(data);
                if(!data.ok) {
                    console.log('NOT OK');
                }
                else {
                    that.UpdateAccount(data.result);
                }
                that.deffered.resolve();
            });
            promise.error(function(data, status, headers, config) {
                console.log('AccountAPI.Load.error...');
                console.log(status);
                that.deffered.resolve();
            });
        };

        this.deffered = $q.defer();
        this.Account = null;
        this.Load();
    }]);

    app.controller('EmployerRegistrationController', ['$scope', 'StaticAPI', 'AccountAPI', 'StreamHireAPI', function($scope, StaticAPI, AccountAPI, StreamHireAPI) {
        $scope.OnForgotPassword = function() {
            var OnForgotPasswordSuccess = function() {
                $scope.HideForgotPasswordButton = true;
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
            };
            var OnForgotPasswordError = function(errorMessage) {
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = errorMessage;
            };
            $scope.ForgotPasswordSubmitting = true;
            AccountAPI.OnForgotPassword($scope.Registration.account.email, OnForgotPasswordSuccess, OnForgotPasswordError);
        };
        $scope.OnSubmitRegistration = function() {
            var OnSubmitRegistrationSuccess = function() {
                $scope.RegistrationSubmitting = false;
                $scope.OnComplete('registration');
            };
            var OnSubmitRegistrationError = function(errors, errorMessage) {
                $scope.RegistrationError  = errors;
                $scope.RegistrationErrorMessage = errorMessage;
                $scope.RegistrationSubmitting = false;
            };

            $scope.RegistrationError = null;
            $scope.RegistrationErrorMessage = null; 
            $scope.RegistrationSubmitting = true;
            AccountAPI.Register('employer', $scope.Registration, OnSubmitRegistrationSuccess, OnSubmitRegistrationError);   
        };
        $scope.OnSubmitLogin = function() {
            var OnSubmitLoginSuccess = function() {
                $scope.LoginSubmitting = false;
                $scope.OnComplete('login');
            };
            var OnSubmitLoginError = function(errors, errorMessage) {
                $scope.LoginError  = errors;
                $scope.LoginErrorMessage = errorMessage;
                $scope.LoginSubmitting = false;
            };

            $scope.LoginError  = null;
            $scope.LoginErrorMessage = null;
            $scope.LoginSubmitting = true;
            AccountAPI.Login('employer', $scope.Login, OnSubmitLoginSuccess, OnSubmitLoginError);   
        };
        $scope.OnComplete = function(type) {
            StreamHireAPI.OnCompletedLogin('employer');
        };

        AccountAPI.deffered.promise.then(function() {
            if(AccountAPI.Account && AccountAPI.Account.jobseeker)
            {
                StreamHireAPI.BumpHome();
            }
        });

        //setup
        $scope.StaticAPI = StaticAPI;

        //forgot password UI
        $scope.HideForgotPasswordButton = false;
        $scope.ForgotPasswordSubmitting = false;
        $scope.ForgotPasswordMessage = null;

        //registration UI
        $scope.RegistrationError = null;
        $scope.RegistrationErrorMessage = null; 
        $scope.RegistrationSubmitting = false;
        //registration DATA
        $scope.Registration = {
            account : {
                name : '',
                phone : '',
                email : '',
                password : ''
            },
            name : '',
            website : '',
            description : ''
        };

        //login UI
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.LoginSubmitting = false;
        //login DATA
        $scope.Login = {
            email : '',
            password : ''
        };
    }]);

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

    app.controller('JobPostCandidateSeekerController', 
        ['$scope', 
        function($scope) {
    }]);



    app.service('LocationAPI', [ function(){
        this.GetLocation = function(onSuccess, onError) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3000 });
            }
            else {
                if(onError) {
                    onError('Location unavailable');            
                }
            } 
        };
    }]);

    app.controller('JobSeekerRegistrationController', ['$scope', 'StaticAPI', 'AccountAPI', 'LocationAPI', function($scope, StaticAPI, AccountAPI, LocationAPI) {   
        $scope.OnForgotPassword = function() {
            var OnForgotPasswordSuccess = function() {
                $scope.HideForgotPasswordButton = true;
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
            };
            var OnForgotPasswordError = function(errorMessage) {
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = errorMessage;
            };

            $scope.LoginError  = null;
            $scope.LoginErrorMessage = null;
            $scope.ForgotPasswordSubmitting = true;
            AccountAPI.OnForgotPassword($scope.Registration.account.email, OnForgotPasswordSuccess, OnForgotPasswordError);
        };
        $scope.OnSubmitRegistration = function() {
            var OnSubmitRegistrationSuccess = function() {
                $scope.RegistrationSubmitting = false;
                $scope.OnComplete('registration');
            };
            var OnSubmitRegistrationError = function(errors, errorMessage) {
                $scope.RegistrationError  = errors;
                $scope.RegistrationErrorMessage = errorMessage;
                $scope.RegistrationSubmitting = false;
            };

            $scope.RegistrationError = null;
            $scope.RegistrationErrorMessage = null; 
            $scope.RegistrationSubmitting = true;
            AccountAPI.Register('jobseeker', $scope.Registration, OnSubmitRegistrationSuccess, OnSubmitRegistrationError);   
        };
        $scope.OnSubmitLogin = function() {
            var OnSubmitLoginSuccess = function() {
                $scope.LoginSubmitting = false;
                $scope.OnComplete('login');
            };
            var OnSubmitLoginError = function(errors, errorMessage) {
                $scope.LoginError  = errors;
                $scope.LoginErrorMessage = errorMessage;
                $scope.LoginSubmitting = false;
            };

            $scope.LoginError  = null;
            $scope.LoginErrorMessage = null;
            $scope.LoginSubmitting = true;
            AccountAPI.Login('jobseeker', $scope.Login, OnSubmitLoginSuccess, OnSubmitLoginError);   
        };

        $scope.OnComplete = function(type) {
            StreamHireAPI.OnCompletedLogin('jobseeker');
        };

        AccountAPI.deffered.promise.then(function() {
            if(AccountAPI.Account && AccountAPI.Account.employer)
            {
                StreamHireAPI.BumpHome();
            }
        });

        $scope.StaticAPI = StaticAPI;

        //forgot password UI
        $scope.HideForgotPasswordButton = false;
        $scope.ForgotPasswordSubmitting = false;
        $scope.ForgotPasswordMessage = null;

        //registration UI
        $scope.RegistrationError = null;
        $scope.RegistrationErrorMessage = null; 
        $scope.RegistrationSubmitting = false;
        //registration DATA
        $scope.Registration = {
            location : {
                name: '',
                lat: 0,
                lon: 0
            },
            account : {
                name : '',
                phone : '',
                email : '',
                password : '',
            },
            distance : 0,
            resume : '',
            availability : StaticAPI.GetFullAvailability(),
            jobtypes : [],
            jobfunctions : []
        };

        //login UI
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.LoginSubmitting = false;
        //login DATA
        $scope.Login = {
            email : '',
            password : ''
        };

        $scope.LocationAvailable = true;
        $scope.GettingLocation = false;
        $scope.LoadingLocationMessage = null;

        $scope.DisableLocation = function() {
            $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
            $scope.GettingLocation = false;
            $scope.LocationAvailable = false;
        };

        $scope.OnGetLocation = function() {
            var msgLocationUnavailable = 'Sorry location is unavailable - please enter a postal code.';
            var OnGetLocationSuccess = function(position) {
                $scope.$apply(function() {
                    $scope.GettingLocation = false;
                    $scope.LoadingLocationMessage = null;
                    $scope.Registration.location.name = 'Current';
                    $scope.Registration.location.lat = position.coords.latitude;
                    $scope.Registration.location.lon = position.coords.longitude;
                });
            };
            var OnGetLocationError = function(error) {
                $scope.$apply(function(){
                    $scope.GettingLocation = false;
                    $scope.DisableLocation();
                });
            };
            $scope.GettingLocation = true;
            $scope.LoadingLocationMessage = 'Loading location...';
            LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
            setTimeout(function(){
                    if($scope.GettingLocation) {
                        $scope.OnGotLocationError();
                }}, 3500);
        };
    }]);


    app.controller('JobSeekerDashboardCtrl', ['$scope', '$location', 'StreamHireAPI', function($scope, $location, StreamHireAPI){
        $scope.OnFindJobs = function() {
            $location.path("/");
        };

        $scope.OnShowJobs = function(type) {
            $scope.Load(1, type);
        };

        $scope.IsJobs = function(type) {
            return $scope.JobTypes === type;
        };

        $scope.Load = function(page, type) {
            if(!$scope.FirstLoad && $scope.JobTypes === type && $scope.Page === page) {
                return;
            }
            $scope.FirstLoad = true;
            var OnLoadSuccess = function(my_jobs) {
                $scope.Page = page;
                $scope.JobTypes = type;
                $scope.MyJobs = my_jobs;
            };
            var OnLoadError = function() {
                console.log("Error loading page");
            };

            var data = {
                page : page,
                type : type
            };
            StreamHireAPI.LoadJobSeekerDashboard(data, OnLoadSuccess, OnLoadError);
        }; 

        $scope.OnPrevPage = function() {
            $scope.Load($scope.Page - 1, $scope.JobTypes);
        };

        $scope.OnNextPage = function() {
            $scope.Load($scope.Page + 1, $scope.JobTypes);
        };

        $scope.getStarCount = function(frac) {

            var result;
            if(frac === 0) {
                result = 0;
            }
            else if(frac <= 0.25) {
                result = 1;
            }
            else if(frac <= 0.5) {
                result = 2;
            }
            else if(frac <= 0.75) {
                result = 3;
            }
            else {
                result = 4;
            }
            return result;
        };

        $scope.GetEmptyStarCount = function(num, denom) {
            var result = $scope.getStarCount((1.0 * num) / (1.0 * denom));
            return new Array(4 - result);
        };

        $scope.GetSolidStarCount = function(num, denom) {
            var result = $scope.getStarCount((1.0 * num) / (1.0 * denom));
            return new Array(result);
        };

        //setup ---------------------------------------------------------
        $scope.FirstLoad = true;
        $scope.Page = 1;
        $scope.JobTypes = 'Applied';
        $scope.MyJobs = {
            total_applied : 0,
            total_invitations : 0,
            jobs : {
                type : 'Applied',
                start : 0,
                end : 0,
                total : 0,
                items : null
            }
        };
        $scope.Load($scope.Page, $scope.JobTypes);
    }])


    app.service('StreamHireAPI', ['$http', '$location', function($http, $location) {
        this.Redirect = null;
        var that = this;
        this.GetLocation = function(code, onSuccess) {
            var OnLocationFromDBSuccess = function(name, lat, lon) {
                console.log("got db location");
                onSuccess(name, lat, lon);
            };
            var OnLocationFromDBError = function() {
                var OnLocationFromGoogleSuccess = function(name, lat, lon) {
                    console.log("got google location");
                    onSuccess(name, lat, lon);
                };
                var OnLocationFromGoogleError = function() {
                    console.log("got papa roached");
                    onSuccess(name, 0, 0);          //last resort
                };

                that.GetLocationFromGoogle(code, OnLocationFromGoogleSuccess, OnLocationFromGoogleError);
            }
            this.GetLocationFromDB(code, OnLocationFromDBSuccess, OnLocationFromDBError);
        }

        this.GetLocationFromGoogle = function(code, onSuccess, onError) {
            //onSuccess(name, lat, lon);
            //onError
            var config = {
                url : 'https://maps.googleapis.com/maps/api/geocode/json',
                params :  {
                    address : code
                }
            };
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                if(data.status === "OK") {
                    onSuccess(code, data.results[0].geometry.location.lat, data.results[0].geometry.location.lon);
                } 
                else {
                    if(onError) {
                        onError();
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError();
                }
            });
        }

        this.GetLocationFromDB = function(code, onSuccess, onError) {
            //onSuccess(name, lat, lon)
            //onError() 
            var config = {
                method: 'POST',
                url: '/rogue/get_location.php',
                data: {
                    location : code
                }
            };
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok || !data.result)
                {
                    if(onError) {
                        onError();
                    }
                }
                else
                {
                    if(onSuccess) {
                        onSuccess(data.result.name, data.result.lat, data.result.lon);
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError();
                }
            });
        };

        this.BumpHome = function(type) {
            if(type === 'employer') {
                $location.path('/employer/dashboard');
            }
            else if(type === 'jobseker')
            {
                $location.path('/jobseeker/dashboard');
            }
            else {
                $location.path('/');
            }
        };

        this.OnCompletedLogin = function(type) {
            if(this.Redirect) {
                $location.path(this.Redirect);
            }
            else {
                this.BumpHome(type);
            }
        };

        this.BumpToLogin = function(type, redirect) {
            if(redirect) {
                this.Redirect = $location.path();
            }
            if(type === 'employer') {
                $location.path('/registration/employer');
            }
            else if(type === 'jobseeker') {
                $location.path('/registration/jobseeker');
            }
        };

        this.SendJobPost = function(data, onSuccess, onError) {
            //onSuccess()
            //onError(errors, msg) 
            var config = {
                method: 'POST',
                url: '/rogue/create_jobpost.php',
                data: data
            };
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(config);
                console.log(data);
                if(!data.ok)
                {
                    if(onError) {
                        onError(data.result.errors, 'Your submission could not be made. Please try again later.');
                    }
                }
                else
                {
                    if(data.result.errors)
                    {
                        if(onError) {
                            onError(data.result.errors, 'Your job post had some problem(s). Please check and resubmit.');
                        }
                    }
                    else
                    {
                        if(onSuccess) {
                            onSuccess();
                        }
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                console.log('FAIL - failed to create jobpost');
                if(onError) {
                    onError(null, 'Your submission could not be made. Please try again later.');
                }
            });
        };
        this.LoadJobSeekerDashboard = function(data, onSuccess, onError) {
            var config = {
                method: 'POST',
                data : data,
                url : '/rogue/get_seekerjobs.php'
            };
            console.log("LoadJobSeekerDashboard");
            console.log(config);
            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log('StreamHireAPI.LoadJobSeekerDashboard.success...');
                console.log(data);
                if(!data.ok) {
                    console.log('NOT OK');
                    if(onError) {
                        onError();
                    }
                }
                else {
                    if(onSuccess) {
                        onSuccess(data.result);
                    }
                }
            });
            promise.error(function(data, status, headers, config) {
                console.log('StreamHireAPI.LoadJobSeekerDashboard.error...');
                console.log(status);
                if(onError) {
                    onError();
                }
            }); 
        };
        this.LoadJobPost = function(data, onSuccess, onError) {
            var config = {
                method: 'POST',
                data : data,
                url : '/rogue/get_jobpost.php'
            };
            console.log("LoadJobPost");
            console.log(config);
            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log('StreamHireAPI.LoadJobPost.success...');
                console.log(data);
                if(!data.ok) {
                    console.log('NOT OK');
                    if(onError) {
                        onError();
                    }
                }
                else {
                    if(!data.result)
                    {
                        return;
                    }

                    if(onSuccess) {
                        onSuccess(data.result);
                    }
                }
            });
            promise.error(function(data, status, headers, config) {
                console.log('StreamHireAPI.LoadJobPost.error...');
                console.log(status);
                if(onError) {
                    onError();
                }
            }); 
        };
        this.GetEmployerJobPosts = function(page, onSuccess, onError){
            //onSuccess(data)
            //onError(reason)
            var config = {
                method: 'POST',
                url: '/rogue/get_jobposts.php',
                data: {
                    page : page
                }
            };

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                if(!data.ok) {
                    if(onError) {
                        onError(data.result);
                    }
                }
                else {
                    if(onSuccess) {
                        onSuccess(data.result);
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError("HTTP_FAIL");
                }
            });
        };
        this.RemoveEmployerJobPost = function(id, onSuccess, onError) {
            // onSuccess({expired : true, expire_days : 2})
            // onError(errortype)
            var config = {
                method: 'POST',
                url: '/rogue/remove_post.php',
                data: {
                    jobid : id
                }
            };
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                if(!data.ok) {
                    if(onError) {
                        onError(data.result);
                    }
                }
                else {
                    if(onSuccess) {
                        onSuccess(data.result);
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError("HTTP_FAIL");
                }
            });
        };
        this.ExtendEmployerJobPost = function(id, onSuccess, onError) {
            // onSuccess()
            // onError(error)
            var config = {
                method: 'POST',
                url: '/rogue/extend_post.php',
                data: {
                    jobid : id
                }
            };

            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                if(!data.ok) {
                    if(onError) {
                        onError(data.result);
                    }
                }
                else {
                    if(onSuccess) {
                        onSuccess();
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError("HTTP_FAIL");
                }
            });
        };

    }]);
})();
