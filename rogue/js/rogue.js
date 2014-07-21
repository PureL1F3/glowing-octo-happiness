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
            controller : 'JobSearchResultsCtrl',
            reloadOnSearch : false
        }).when('/jobpost', {
            templateUrl : 'partials/jobpost-create.html',
            controller : 'JobPostCreateCtrl'
        })
        .when('/viewjob/:id/:search', {
            templateUrl : 'partials/jobpost-view.html',
            controller : 'JobPostViewCtrl'
        }).when('/registration/employer', {
            templateUrl : 'partials/registration-employer.html',
            controller : 'EmployerRegistrationController'
        }).when('/registration/jobseeker', {
            templateUrl : 'partials/registration-employee.html',
            controller : 'JobSeekerRegistrationController'
        }).when('/yesda', {
            templateUrl : 'partials/yesda.html',
            controller : 'YesdaCtrl',
            resolve : {
                'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                }
            }
        }).otherwise({
            redirectTo : '/'
        });
    }]);

    app.controller('YesdaCtrl', ['$scope', 'AccountAPI', function($scope, AccountAPI){
        console.log('loading yesda');
        $scope.AccountAPI = AccountAPI;
    }]);

    app.controller('NavCtrl', ['$scope', '$location', 'AccountAPI', function($scope, $location, AccountAPI){
        console.log('loading nav');
        $scope.AccountAPI = AccountAPI;
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

    app.controller('JobSearchHomeCtrl', ['SHUtility', 'SearchAPI', 'StaticAPI', 'LocationAPI', 'StreamHireAPI', '$scope', '$location', '$http', function(SHUtility, SearchAPI, StaticAPI, LocationAPI, StreamHireAPI, $scope, $location, $http){
        $scope.StaticAPI = StaticAPI;
        var that = this;
        $scope.DoSearch = function() {
            SearchAPI.SetSearchParams($scope.SearchParams);
            var params = {
                avail : SHUtility.ConvertAvailabilityToString($scope.SearchParams.availability, StaticAPI.AvailabilityDays.length, StaticAPI.AvailabilityCategories.length),
                loc : $scope.SearchParams.location.name,
                lat : $scope.SearchParams.location.lat,
                lon : $scope.SearchParams.location.lon
            }
            $location.path('/jobresults').search(params);
        };
        $scope.OnSearch = function() {
            //check if already have location
            //else get location
            //final thing is check that we are down!

            $scope.SearchParams.location.name = $scope.SearchParams.location.name.replace(/[^a-z0-9]/gi,'');
            $scope.SearchErrors = null;
            var postalcode_err = 'Please enter your postal code';
            var availability_err = 'Please enter your availability';

            
            var location_len = $scope.SearchParams.location.name.length;
            if(location_len < 1)
            {
                $scope.ShowSearchError('location', postalcode_err);
                if(!SearchAPI.IsAvailabilityValid($scope.SearchParams.availability)) {
                    $scope.ShowSearchError('availability', availability_err);
                }
            }
            else if(!($scope.SearchParams.location.lat && $scope.SearchParams.location.lon))
            {
                var OnLocationSuccess = function(code, lat, lon) {
                    $scope.SearchParams.location.name = code;
                    $scope.SearchParams.location.lat = lat;
                    $scope.SearchParams.location.lon = lon;
                    if(!SearchAPI.IsAvailabilityValid($scope.SearchParams.availability)) {
                        $scope.ShowSearchError('availability', availability_err);
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
                    $scope.ShowSearchError('availability', availability_err);
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

    app.controller('JobSearchResultsCtrl', ['SHUtility', 'SearchAPI', 'StaticAPI', 'StreamHireAPI', 'LocationAPI', '$scope', '$location', '$anchorScroll', function(SHUtility, SearchAPI, StaticAPI, StreamHireAPI, LocationAPI, $scope, $location, $anchorScroll){
        $scope.SHUtility = SHUtility;

        $scope.CaptureCurrentLocation = function() {
            $scope.CurrentLocation = $scope.SearchParams.location.name;
            $scope.CurrentLocationLat = $scope.SearchParams.location.lat;
            $scope.CurrentLocationLon = $scope.SearchParams.location.lon;
        };
        $scope.ScrollToTop = function() {
            $location.hash('top');
            $anchorScroll();
        };
        $scope.ToggleSearchParamsExpanded = function() {
            $scope.SearchParamsExpanded = !$scope.SearchParamsExpanded;   
        }
        //load results
        $scope.Load = function() {
            var OnLoadSuccess = function() {
                $scope.Loading = false;
                if(SearchAPI.SearchResults.total === 0 || SearchAPI.SearchResults.end === SearchAPI.SearchResults.total) {
                    $scope.SearchParamsExpanded = true;
                }
            };
            var OnLoadError = function(error) {
                $scope.Loading = false;
                $scope.SearchParamsExpanded = true;
            };
            $scope.Loading = true;
            var search = $scope.SearchParams;
            search['page'] = $scope.Page;
            SearchAPI.PerformSearch(search, OnLoadSuccess, OnLoadError);
        }
        $scope.ShowSearchError = function(key, error) {
            if(!$scope.SearchErrors) {
                $scope.SearchErrors = {};
            }
            $scope.SearchErrors[key] = error;
        };
        $scope.OnSearch = function() {
            //clear any search errors from before
            $scope.SearchErrors = null;

            //if we changed the location name but the coords are same - force refresh (set coords to null)
            if($scope.SearchParams.location.name != $scope.CurrentLocation && 
                (   $scope.CurrentLocationLat === $scope.SearchParams.location.lat && 
                    $scope.CurrentLocationLon === $scope.SearchParams.location.lon)) {
                $scope.SearchParams.location.lat = null;
                $scope.SearchParams.location.lon = null;
            };

            //strip out any input that's not alphanumeric from the location name
            var location = $scope.SearchParams.location.name.replace(/[^a-z0-9]/gi,'');
            var location_len = location.length;
            if(location_len < 1)
            {
                $scope.ShowSearchError('location', 'Please enter your postal code');
                if(!SearchAPI.IsAvailabilityValid($scope.SearchParams.availability)) {
                    $scope.ShowSearchError('availability', 'Please select your availability');
                }
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

        $scope.DoSearch = function() {
             SearchAPI.SetSearchParams($scope.SearchParams);
             $scope.Page = 1;
             $scope.Load();
        };

        $scope.InitSearchParams = function() {
            //start with an empty search 
            var searchparams = SearchAPI.GetEmptySearchParams();

            //load the location and availability search params from search string
            var urlparams = $location.search(); 
            var valid_location = false;
            var loc = null;
            var lat = null;
            var lon = null;
            var MAX_LOCATION_LEN = 10;
            if(urlparams.loc 
                && (typeof urlparams.loc) === 'string'
                && urlparams.loc.length >= 1 
                && urlparams.loc.length <= MAX_LOCATION_LEN)
            {
                loc = urlparams.loc;
                if(urlparams.lat)
                {
                    lat = parseFloat(urlparams.lat);
                    if(!isNaN(lat) && Math.abs(lat) <= 90)
                    {
                        if(urlparams.lon)
                        {
                            lon = parseFloat(urlparams.lon);
                            if(!isNaN(lon) && Math.abs(lon) <= 180) {
                                valid_location = true;
                            }

                        }
                    }
                }
            }
            var valid_availability = false;
            var availability = null;
            if(urlparams.avail 
               && (typeof urlparams.loc) === 'string') {
                availability = SHUtility.ConvertStringToAvailability(urlparams.avail);
                valid_availability = (availability != null);
            }

            var valid_page = true;
            var page = 1;
            if(urlparams.p) {
                var p = parseInt(urlparams.p);
                if(!isNaN(p) && p > 0) {
                    page = p;
                }
                else {
                    valid_page = false;
                }
            }

            //if we have valid search params from url assign them else clear them out
            var valid_urlsearchparams = valid_availability && valid_location && valid_page;
            if(valid_urlsearchparams) {
                searchparams.location.name = loc;
                searchparams.location.lat = lat;
                searchparams.location.lon = lon
                searchparams.availability = availability;
                searchparams.page = page;
            }
            else {
                $location.search({});
            }
            $scope.SearchParams = searchparams;

            //capture the current location used to perform the search - will be used to know if need to reload location
            if(valid_urlsearchparams) {
                $scope.CaptureCurrentLocation();
                //if we have a valid search perform
            }
        }

        $scope.SearchErrors = null;
        //setup libs used in UI
        $scope.StaticAPI = StaticAPI;
        $scope.SearchAPI = SearchAPI;

        //search param setup
        $scope.SearchParams = null;
        $scope.InitSearchParams();
        //$scope.SearchParams = SearchAPI.GetSearchParams();
        //current location capture for location reload on change
        $scope.CurrentLocation = null;
        $scope.CurrentLocationLat = null;
        $scope.CurrentLocationLon = null;
        $scope.CaptureCurrentLocation();
        //search param div expansion
        $scope.SearchParamsExpanded = false;
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

        //$scope.Load();
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

    app.service('SHUtility', [function(){

        this.ConvertAvailabilityToString = function(availability, days, categories) {
            var path = '' + days + categories;
            for(var i = 0; i < availability.length; i++) {
                for(var j = 0; j < availability[i].length; j++) {
                    path += availability[i][j] ? '1' : '0';
                }
            }
            return path;
        }
        this.ConvertStringToAvailability = function(path) {
            var pathbits = path.split('');
            var pathbitslen = pathbits.length;
            if(pathbitslen <= 2) {
                return null;
            }
            var days = parseInt(path[0]);
            var categories = parseInt(path[1]);
            if( isNaN(days) || days===0 || isNaN(categories) || categories===0 || (pathbitslen != 2 + days * categories))
            {
                return null;
            }
            var availability = [];
            for(var i = 0; i < days; i++) {
                availability[i] = [];
                for(var j = 0; j < categories; j++) {
                    availability[i][j] = (pathbits[2 + i * categories + j] === '1');
                }
            }
            console.log(availability);
            return availability;
        }

        this.GetInDaysString = function(days) {
            var str = "";
            if(days == 0) {
                str = "today";
            }
            else if(days == 1) {
                str = "in 1 day";
            }
            else {
                str = "in " + days + " days";
            }
            return str;
        }

        this.GetDaysAgoString = function(days) {
            var str = "";
            if(days == 0) {
                str = "today";
            }
            else if(days == 1) {
                str = "1 day ago";
            }
            else {
                str = "" + days + " days ago";
            }
            return str;
        };

        this.getStarCount = function(frac) {

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

        this.GetEmptyStarCount = function(num, denom) {
            var result = denom === 0 ? 0 : this.getStarCount((1.0 * num) / (1.0 * denom));
            return new Array(4 - result);
        };

        this.GetSolidStarCount = function(num, denom) {
            var result = denom === 0 ? 0 : this.getStarCount((1.0 * num) / (1.0 * denom));
            return new Array(result);
        };

    }]);
    app.service('SearchAPI', ['$http', 'StaticAPI', function($http, StaticAPI){
        var that = this;
        this.SearchResults = {
            total : 0,
            start : 0,
            end : 0,
            results : []
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

        this.GetCopyOfAvailability =function(availability) {
            return angular.copy(availability);
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

        this.PerformSearch = function(searchParams, onSuccess, onError) {
            //onSuccess : function(results)
            //onError : function(errors, msg)
            var msgError = 'Your search had some problem(s). Please check and try again.';
            var msgFailed = 'We could not perform your search right now. Please try again later.';

            var config = {
                method: 'POST',
                data : searchParams,
                url : '/rogue/search.php'
            };
            console.log(config);
            var promise = $http(config);
            promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok) {
                    if(onError) {
                        onError(null, msgFailed);
                    }
                }
                else if(data.result.errors) {
                    if(onError) {
                        onError(data.result.errors, msgError);
                    }
                }
                else {
                    that.SearchResults = data.result;
                    if(onSuccess) {
                        onSuccess();
                    }
                }
            });
            promise.error(function(data, status, headers, config) {
                console.log("Fail search");
                console.log(data);
                if(onError) {
                    onError(null, msgFailed);
                }
            });
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

/*    app.service('AccountAPI', ['$http', '$q', function($http, $q) { 
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
    }]);*/

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
        ['SHUtility' , 'StaticAPI', '$scope', '$window', '$location', '$routeParams', 'AccountAPI', 'StreamHireAPI', 'SearchAPI',
        function(SHUtility, StaticAPI, $scope, $window, $location, $routeParams, AccountAPI, StreamHireAPI, SearchAPI){
        $scope.SHUtility = SHUtility;
        $scope.StaticAPI = StaticAPI;
        $scope.Application = {
            jobid : parseInt($routeParams.id),
            name : '',
            email : '',
            phone : '',
            resume : '',
            availability :  StaticAPI.GetFullAvailability(),
            availability_hours : null
        };
        $scope.ApplicationError = null;
        $scope.ApplicationErrorMessage = null;
        $scope.ApplicationSubmitting = false;
        $scope.ShowApplication = false;
        $scope.ShowApplicationSuccess = false;
        $scope.OnApply = function() {
            if($scope.Job.externalurl && $scope.Job.externalurl.length > 0)
            {
                $window.open($scope.Job.externalurl);
            }
            else
            {
                $scope.ShowApplication = true;
            }
        };

        $scope.OnSubmitApplication = function() {
            var OnSubmitApplicationError = function(errors, errmsg) {
                $scope.ApplicationError = errors;
                $scope.ApplicationErrorMessage = errmsg;
                $scope.ApplicationSubmitting = false;
            };
            var OnSubmitApplicationSuccess = function() {
                $scope.Job.applied = true;
                $scope.ShowApplication = false;
                $scope.ShowApplicationSuccess = true;
                $scope.ApplicationSubmitting = false;
            }
            $scope.ApplicationError = null;
            $scope.ApplicationErrorMessage = null;
            $scope.ApplicationSubmitting = true;
            StreamHireAPI.SubmitJobApplication($scope.Application, OnSubmitApplicationSuccess, OnSubmitApplicationError);          
        };

        $scope.Load = function() {
            var OnLoadSucccess = function(job) {
                $scope.Job = job;
                $scope.LoadingJobPost = false;
            };

            var OnLoadError = function(error) {
                $scope.JobLoadError = error;
            }
            $scope.JobLoadError = null;
            $scope.LoadingJobPost = true;
            console.log('loading ');
            console.log($scope.JobId);
            console.log($scope.Availability);
            StreamHireAPI.LoadJobForUserView($scope.Application.jobid, $scope.Application.availability, OnLoadSucccess, OnLoadError);
        };

        $scope.OnClickBack = function() {
            $window.history.back();
        };

        AccountAPI.deffered.promise.then(function() {
            console.log($location.search());
            //setup availability
            if($routeParams.search === 'search') {
                $scope.Application.availability = SearchAPI.GetCopyOfAvailability(SearchAPI.SearchParams.availability);
            }
            else if(AccountAPI.Account && AccountAPI.Account.jobseeker) {
                $scope.Application.availability = SearchAPI.GetCopyOfAvailability(AccountAPI.Account.jobseeker.availability);
            }

            //setup application form
            if(AccountAPI.Account && AccountAPI.Account.jobseeker) {
                $scope.Application.name = AccountAPI.Account.account.name;
                $scope.Application.email = AccountAPI.Account.account.email;
                $scope.Application.phone = AccountAPI.Account.account.phone;
                $scope.Application.resume = AccountAPI.Account.jobseeker.resume;            
            }
            $scope.Load();
        });
    }]);

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

    app.controller('JobSeekerRegistrationController', ['$scope', 'StaticAPI', 'AccountAPI', 'LocationAPI', 'StreamHireAPI', function($scope, StaticAPI, AccountAPI, LocationAPI, StreamHireAPI) {   
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


    app.controller('JobSeekerDashboardCtrl', ['SHUtility', '$scope', '$location', 'StreamHireAPI', function(SHUtility, $scope, $location, StreamHireAPI){
        


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

        this.LoadJobForUserView = function(id, availability, onSuccess, onError) {
            //onSuccess(job)
            //onError(errmsg)
            var config = {
                method: 'POST',
                url: '/rogue/get_jobpost.php',
                data: {
                    jobid : id,
                    availability : availability
                }
            };
            var failMsg = "Sorry, this jobpost is unavailable. Please try again later.";
            $promise = $http(config);
            $promise.success(function(data, status, headers, config) {
                console.log(data);
                if(!data.ok) {
                    if(onError) {
                        onError(failMsg);
                    }
                }
                else {
                    if(onSuccess) {
                        onSuccess(data.result);
                    }
                    else
                    {
                        onError(failMsg);
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError(failMsg);
                }
            });
        };

        this.SubmitJobApplication = function(application, onSuccess, onError) {
            //onSuccess()
            //onError(errors, errmsg)
            var config = {
                method: 'POST',
                url: '/rogue/submit_jobapplication.php',
                data: application
            };

            var failMsg = "Sorry, you application could not be submitted. Please try again later.";
            var errorMsg = "Your application had some problems. Please check and submit again.";

            $promise = $http(config);
            console.log($promise);
            $promise.success(function(data, status, headers, config) {
                if(!data.ok) {
                    if(onError) {
                        onError(null, failMsg);
                    }
                }
                else {
                    if(data.result.errors) {
                        onError(data.result.errors, errorMsg);
                    }
                    else {
                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                }
            });
            $promise.error(function(data, status, headers, config) {
                if(onError) {
                    onError(null, failMsg);
                }
            });
        };
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

app.constant('MagicMikeAPI', {
    //----------------------_HTTP PLAYPEN_---------------------------
    //---------------------------------------------------------------
    GET : 'GET',
    POST : 'POST',
    //----------------------_ACTION TARGETS_-------------------------
    //---------------------------------------------------------------
    //.account loading
    LoadAccount : '/rogue/load_account.php',
    //.account login submission
    LoginEmployerAccount : '/rogue/login_employer.php',
    LoginJobseekerAccount : '/rogue/login_jobseeker.php',
    //.account registration submission
    RegisterEmployerAccount : '/rogue/register_employer.php',
    RegisterJobseekerAccount : '/rogue/register_jobseeker.php',
    //-----------------------_DEFINITIONS_---------------------------
    //---------------------------------------------------------------
    Employer : 'employer',
    Jobseeker : 'jobseeker',

    //-----------------------_ROUTING_-------------------------------
    //---------------------------------------------------------------
    LocationHome : '/'
});

app.service('AccountAPI', ['$http', '$cookieStore', '$q', 'MagicMikeAPI', function($http, $cookieStore, $q, MagicMikeAPI) { 
    var that = this;
    this.observerCallbacks = [];  
    this.IsEmployer = function() {
        return this.Account && this.Account.employer;
    };
    
    this.IsJobseeker = function() {
        return this.Account && this.Account.jobseeker;
    };

    this.registerObserverCallback = function(callback){
        this.observerCallbacks.push(callback);
    };

    this.notifyObservers = function(){
        angular.forEach(this.observerCallbacks, function(callback){
            callback();
        });
    };

    this.UpdateAccount = function(account) {
        this.notifyObservers();
    };
    this.Logout = function() {
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.UpdateAccount(null);
        $location.path(MagicMikeAPI.LocationHome);
    };
    this.Register = function(type, registration) {
        //success - empty result
        //error - dictionary {msg, [errors]}
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url :   type == MagicMikeAPI.Employer ? MagicMikeAPI.RegisterEmployerAccount : MagicMikeAPI.RegisterJobseekerAccount,
            data : registration
        };

        var msgFailed = 'We could not register you right now. Please try again later.';
        var msgError = 'Your registration had some problem(s). Please check and try again.';

        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                deferred.reject({msg : msgFailed});
            }
            else if(data.result.errors) {
                deferred.reject({msg : msgError, errors : data.result.errors});
            }
            else {
                that.UpdateAccount(data.result);
                deferred.resolve();
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject({msg : msgFailed});
        });
        return deferred;
    };
    this.Login = function(type, login) {
        //success - empty result
        //error - dictionary {msg, [errors]}
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url : type == MagicMikeAPI.Employer ? MagicMikeAPI.LoginEmployerAccount : MagicMikeAPI.LoginJobseekerAccount,
            data : login
        };

        var msgFailed = 'We could not log you in right now. Please try again later.';
        var msgError = 'Your login had some problem(s). Please check and try again.';

        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                deferred.reject({msg : msgFailed});
            }
            else if(data.result.errors) {
                deferred.reject({msg : msgError, errors : data.result.errors});
            }
            else {
                that.UpdateAccount(data.result);
                deferred.resolve();
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject({msg : msgFailed});
        });
        return deferred;
    };
    this.Load = function() {
        console.log('loading account');
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.GET,
            url :   MagicMikeAPI.LoadAccount
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            console.log('loading account -- succs');
                if(!data.ok) {
                     //something went wrong
                    console.log("Failed to load account. Continue with resolve!");
                    console.log(data);
                }
                else {
                    that.UpdateAccount(data.result);
                }
                deferred.resolve();
        });
        promise.error(function(data, status, headers, config) {
            console.log('loading account - errr');
                deferred.resolve();
        });
    };
    this.Account = null;
    this.deferred = $q.defer();
    this.promise = this.deferred.promise;
    this.Load();
    return this;
}]);

})();
