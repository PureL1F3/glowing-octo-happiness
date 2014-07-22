// Assumption - using 4 hour blocks to represent time [6-10AM, 10AM-2PM, 2-6PM, 6-10PM, 10PM-2AM, 2-6AM]

(function() {
    var app = angular.module('rogue', ['ui.bootstrap', 'ngRoute', 'ngCookies', 'ngAnimate']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'partials/jobsearch-home.html',
            controller : 'JobSearchHomeCtrl'
        }).when('/account', {
            templateUrl : 'partials/account-picker.html',
            controller : 'AccountPickerCtrl',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                }
            }
        }).when('/employer/dash', {
            templateUrl : 'partials/employer-posted.html',
            controller : 'EmployerDashboardCtrl',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                }
            }
        }).when('/employer/job/:jobid/candidates/:type/:page', {
            templateUrl : 'partials/jobpost-candidates.html',
            controller : 'EmployerJobCandidatesCtrl'
        }).when('/jobseeker/dash', {
            templateUrl : 'partials/jobseeker-dashboard.html',
            controller : 'JobSeekerDashboardCtrl',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                }
            }
        }).when('/jobs', {
            templateUrl : 'partials/jobsearch-results.html',
            controller : 'JobSearchResultsCtrl',
            reloadOnSearch : false,
            resolve : {
                'StaticData' : function(StaticAPI) {
                    return StaticAPI.promise;
                }
            }
        }).when('/employer/job', {
            templateUrl : 'partials/jobpost-create.html',
            controller : 'JobPostCreateCtrl',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise
                },
                'StaticData' : function(StaticAPI) {
                    return StaticAPI.promise;
                }
            }
        })
        .when('/job', {
            templateUrl : 'partials/jobpost-view.html',
            controller : 'JobPostViewCtrl',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                }
            }
        }).when('/employer/registration', {
            templateUrl : 'partials/registration-employer.html',
            controller : 'EmployerRegistrationController',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                },
                'StaticData' : function(StaticAPI) {
                    return StaticAPI.promise;
                }
            }
        }).when('/jobseeker/registration', {
            templateUrl : 'partials/registration-employee.html',
            controller : 'JobSeekerRegistrationController',
            resolve : {
               'AccountData' : function(AccountAPI) {
                    return AccountAPI.promise;
                },
                'StaticData' : function(StaticAPI) {
                    return StaticAPI.promise;
                }
            }
        })
        .otherwise({
            redirectTo : '/'
        });
    }]);
    app.controller('NavCtrl', ['$scope', '$location', 'AccountAPI', 'MagicMikeService', 
        function($scope, $location, AccountAPI, MagicMikeService){
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
                MagicMikeService.RouteToAccountPicker();
            }
            else if(AccountAPI.IsEmployer()) {
                MagicMikeService.RouteToEmployerDashboard();
            }
            else if(AccountAPI.Account.jobseeker) {
                MagicMikeService.RouteToJobseekerDashboard();
            }
        };
        
        $scope.OnLogout = function() {
            AccountAPI.Logout();
            MagicMikeService.RouteToHome();
        };
        AccountAPI.registerObserverCallback($scope.UpdateNav);
    }])

    app.controller('AccountPickerCtrl', ['$scope', '$location', 'MagicMikeService', 'AccountAPI', function($scope, $location, MagicMikeService, AccountAPI){
        $scope.OnJobSeekerAccount = function()
        {
            MagicMikeService.RouteToJobseekerRegistration();
        };

        $scope.OnEmployerAccount = function() {
            MagicMikeService.RouteToEmployerRegistration();
        };

        if(AccountAPI.IsLoggedIn()) {
            if(AccountAPI.IsEmployer()) {
                MagicMikeService.RouteToEmployerDashboard();
            }
            else {
                MagicMikeService.RouteToJobseekerDashboard();
            }
        }
    }]);

//     app.controller('EmployerJobCandidatesCtrl', ['$scope', '$http', '$location', '$routeParams', '$anchorScroll', '$window', 'StaticAPI' , 
//         function($scope, $http, $location, $routeParams, $anchorScroll, $window, StaticAPI){
//         $scope.StaticAPI = StaticAPI;
//         $scope.Load = function()
//         {
//             var config = {
//                 method: 'POST',
//                 url: '/rogue/get_candidates.php',
//                 data: {
//                     jobid : $scope.JobId,
//                     candidate_type : $scope.CandidateType,
//                     page : $scope.Page
//                 }
//             };
//             console.log(config);
//             $promise = $http(config);
//             $promise.success(function(data, status, headers, config) {
//                 console.log(config);
//                 console.log(data);
//                 if(!data.ok)
//                 {
//                     console.log("SUCCESS - Failed to load: " + data.result);
//                 }
//                 else
//                 {
//                     console.log("SUCCESS - Loaded");
//                     $scope.Job = data.result.job;
//                     $scope.Candidates = data.result.candidates;
//                     $scope.start = data.result.start;
//                     $scope.end = data.result.end;
//                     $scope.total = data.result.total;

//                     //scroll to top of page
//                     $location.hash('top');
//                     $anchorScroll();
//                 }
//             });
//             $promise.error(function(data, status, headers, config) {
//                 console.log("ERROR - Failed to load: " + status);
//             });
//         };            

//         $scope.Job = {};
//         $scope.Candidates = {};

//         $scope.start = 0;
//         $scope.end = 0;
//         $scope.total = 0;

//         $scope.IsCandidates = function(type)
//         {
//             return $scope.Candidates.type === type;
//         }

//         $scope.getTimes=function(n){
//             return new Array(n);
//         };

//         $scope.OnBackToPostedJobs = function() {
//             $window.history.back();
//         };

//         $scope.OnViewCandidates = function(id, type){
//             if(type === 'new')
//             {
//                 $scope.JobId = id;
//                 $scope.CandidateType = 'New';
//                 $scope.Page = 1;
//                 $scope.Load();
//             }
//             else if(type === 'yes')
//             {
//                 $scope.JobId = id;
//                 $scope.CandidateType = 'Yes';
//                 $scope.Page = 1;
//                 $scope.Load();
//             }
//             else if(type === 'no')
//             {
//                 $scope.JobId = id;
//                 $scope.CandidateType = 'No';
//                 $scope.Page = 1;
//                 $scope.Load();
//             }
//             else if(type === 'matches')
//             {
//                 $location.path('/employer/job/' + id + '/matches');
//             }
//         };

//         $scope.DoesJobPostExpireInMoreThanSeven = function(expire_days) {
//             return expire_days >= 7;
//         }

//         $scope.OnRemovePost = function(id) {
//             var config = {
//                 method: 'POST',
//                 url: '/rogue/remove_post.php',
//                 data: {
//                     jobid : id
//                 }
//             };
//             console.log(config);
//             $promise = $http(config);
//             $promise.success(function(data, status, headers, config) {
//                 console.log(config);
//                 console.log(data);
//                 if(!data.ok)
//                 {
//                     console.log("SUCCESS - Failed to remove post: " + data.result);
//                 }
//                 else
//                 {
//                     console.log("SUCCESS - removed post");
//                     $scope.Job.expire_days = 0;
//                     $scope.Job.expired = true;
//                 }
//             });
//             $promise.error(function(data, status, headers, config) {
//                 console.log("ERROR - Failed to removed post: " + status);
//             });
//         };

//         $scope.OnExtendPost = function(id) {
//             var config = {
//                 method: 'POST',
//                 url: '/rogue/extend_post.php',
//                 data: {
//                     jobid : id
//                 }
//             };
//             console.log(config);
//             $promise = $http(config);
//             $promise.success(function(data, status, headers, config) {
//                 console.log(config);
//                 console.log(data);
//                 if(!data.ok)
//                 {
//                     console.log("SUCCESS - Failed to extend post: " + data.result);
//                 }
//                 else
//                 {
//                     if(data.result.error)
//                     {
//                         console.log("SUCCESS - extend post - error");
//                     }
//                     else
//                     {
//                         $scope.Job.expire_days = data.result.expiry_days;
//                     }
//                 }
//             });
//             $promise.error(function(data, status, headers, config) {
//                 console.log("ERROR - Failed to extend post: " + status);
//             });
//         };

//         $scope.OnModifyCandidate = function(jobid, id, mod) {
//             if(mod == 'yes')
//             {
//             }
//             else if(mod == 'no')
//             {

//             }
//             else
//             {
//                 return;
//             }

//             var config = {
//                 method: 'POST',
//                 url: '/rogue/mod_candidate.php',
//                 data: {
//                     jobid : jobid,
//                     applicationid : id,
//                     state : mod
//                 }
//             };
//             console.log(config);
//             $promise = $http(config);
//             $promise.success(function(data, status, headers, config) {
//                 console.log(config);
//                 console.log(data);
//                 if(!data.ok)
//                 {
//                     console.log("SUCCESS - Failed to modify candidate: " + data.result);
//                     //remove candidate from ui 
//                     for(var i = 0; i < $scope.Candidates.profiles.length; i++)
//                     {
//                         if($scope.Candidates.profiles[i].id === id)
//                         {
//                             $scope.Candidates.profiles.splice(i, 1);
//                         }
//                     }
//                 }
//                 else
//                 {
//                     console.log("SUCCESS - modified candidate");
//                     $scope.Job.expire_days = data.result.expiry_days;
//                 }
//             });
//             $promise.error(function(data, status, headers, config) {
//                 console.log("ERROR - Failed to modify candidate: " + status);
//             });
//         }

//         //pagination
//         $scope.OnNextPage = function() {
//             $scope.Page++;
//             $scope.Load();
//         };
//         $scope.OnPrevPage = function() {
//             $scope.Page--;
//             $scope.Load();
//         };

//         $scope.Initialize = function() {
//             $scope.JobId = parseInt($routeParams.jobid);
//             $scope.CandidateType = $routeParams.type;
//             $scope.Page = parseInt($routeParams.page);
//         }

//         $scope.Initialize();
//         $scope.Load();
//     }]);

//     app.controller('EmployerDashboardCtrl', ['$scope', '$location', '$anchorScroll', 'StaticAPI', 'StreamHireAPI','AccountAPI',
//         function($scope, $location, $anchorScroll, StaticAPI, StreamHireAPI, AccountAPI){
        
//         $scope.ScrollToTop = function() {
//             $location.hash('top');
//             $anchorScroll();
//         };
//         $scope.UpdateJobpostExpiry = function(id, expired, expiry_days) {
//             for(var i = 0; i < $scope.PostedJobs.jobs.length; i++) {
//                 if($scope.PostedJobs.jobs[i].id == id) {
//                     $scope.PostedJobs.jobs[i].expire_days = expiry_days;
//                     $scope.PostedJobs.jobs[i].expired = expired;
//                     break;
//                 }
//             }   
//         };
//         $scope.Load = function() {
//             var OnLoadSuccess = function(postedjobs) {
//                 $scope.Loading = false;
//                 $scope.PostedJobs = postedjobs;
//                 $scope.ScrollToTop();
//             };
//             var OnLoadError = function(error) {
//                 if(error === "NOT_AUTH") {
//                     StreamHireAPI.BumpToLogin('employer', true);
//                 }
//                 else 
//                 $scope.Loading = false;
//                 console.log("Failed to load page" + error);
//             };
//             $scope.Loading = true;
//             StreamHireAPI.GetEmployerJobPosts($scope.Page, OnLoadSuccess, OnLoadError)
//         }
//         $scope.OnPostJob = function() {
//             $location.path('/jobpost');
//         };
//         $scope.OnExtendPost = function(id) {
//             var OnExtendSuccess = function(data){
//                 $scope.UpdateJobpostExpiry(id, data.expired, data.expiry_days);
//                 $scope.PostedJobExtending[id] = false;
//             };
//             var OnExtendError = function(error) {
//                 if(error.type && error.type === "INVALID_EXTENDPOST_EXPIRED") {
//                     $scope.UpdateJobpostExpiry(id, error.data.expired, error.data.expiry_days);
//                     $scope.PostedJobModifyErrors[id] = 'Sorry, this jobpost is already expired.';
//                 }
//                 else if(error.type && error.type === "INVALID_EXTENDPOST_TOOEARLY") {
//                     $scope.UpdateJobpostExpiry(id, error.data.expired, error.data.expiry_days);
//                     $scope.PostedJobModifyErrors[id] = 'Sorry, you can only extend the post in the last 7 days.';
//                 }
//                 else if(error === "NOT_AUTH") {
//                     StreamHireAPI.BumpToLogin('employer', true);
//                 }
//                 else {
//                     $scope.PostedJobModifyErrors[id] = 'Sorry, failed to extend post. Please try again later.';
//                 }
//                 $scope.PostedJobExtending[id] = false;
//             };
//             delete $scope.PostedJobModifyErrors[id];
//             $scope.PostedJobExtending[id] = true;
//             StreamHireAPI.ExtendEmployerJobPost(id, OnExtendSuccess, OnExtendError);
//         };
//         $scope.OnRemovePost = function(id) {
//             var OnRemoveSuccess = function(data){
//                 $scope.UpdateJobpostExpiry(id, data.expired, data.expire_days);
//                 $scope.PostedJobRemoving[id] = false;
//             };
//             var OnRemoveError = function() {
//                 if(error === "NOT_AUTH") {
//                     StreamHireAPI.BumpToLogin('employer', true);
//                 }
//                 else {
//                     $scope.PostedJobModifyErrors[id] = "Sorry, failed to expire post. Please try again later.";
//                 }
//                 $scope.PostedJobRemoving[id] = false;
//             };

//             delete $scope.PostedJobModifyErrors[id];
//             $scope.PostedJobRemoving[id] = true;
//             StreamHireAPI.RemoveEmployerJobPost(id, onRemoveSuccess, onRemoveError);
//         };
//         $scope.DoesJobPostExpireInMoreThanSeven = function(expire_days) {
//             return expire_days >= 7;
//         }
//         //pagination
//         $scope.OnNextPage = function() {
//             $scope.Page++;
//             $scope.Load();
//         };
//         $scope.OnPrevPage = function() {
//             $scope.Page--;
//             $scope.Load();
//         };
//         $scope.OnViewCandidates = function(id, type){
//             if(type === 'New' || type === 'Yes' || type === 'No')
//             {
//                 $location.path('/employer/job/' + id + "?type=" + type + "&page=1");
//             }
//             else if(type === 'matches')
//             {
//                 $location.path('/employer/job/' + id + '/matches');
//             }
//         };

//         AccountAPI.deffered.promise.then(function() {
//             if(!(AccountAPI.Account && AccountAPI.Account.employer)){
//                 StreamHireAPI.BumpHome();
//             }
//         });
//         //------------------UI for loading job post
//         $scope.Loading = false;
//         $scope.LoadingErrorMessage = null;

//         //------------------UI for extending/removing job post
//         $scope.PostedJobModifyErrors = {};
//         $scope.PostedJobExtending = {};
//         $scope.PostedJobRemoving = {};

//         $scope.StaticAPI = StaticAPI;
//         $scope.Page = 1;

//         $scope.PostedJobs = {};
//         $scope.Load();
//     }]);
//     app.controller('JobPostCreateCtrl', ['StaticAPI', '$scope', '$location', '$routeParams', 'AccountAPI', 'StreamHireAPI', 'LocationAPI', function(StaticAPI, $scope, $location, $routeParams, AccountAPI, StreamHireAPI, LocationAPI) {    

//         $scope.DisableLocation = function() {
//             $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
//             $scope.GettingLocation = false;
//             $scope.LocationAvailable = false;
//         };
//         $scope.GetLocation = function() {
//             var OnGetLocationSuccess = function(position) {
//                 $scope.$apply(function() {
//                     $scope.GettingLocation = false;
//                     $scope.LoadingLocationMessage = null;
//                     $scope.Jobpost.location.name = 'Current';
//                     $scope.Jobpost.location.lat = position.coords.latitude;
//                     $scope.Jobpost.location.lon = position.coords.longitude;
//                 });
//             };
//             var OnGetLocationError = function(error) {
//                 $scope.$apply(function() {
//                     $scope.DisableLocation();
//                 });
//             };
//             $scope.GettingLocation = true;
//             $scope.LoadingLocationMessage = 'Loading location...';
//             LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
//             setTimeout(function(){
//                     if($scope.GettingLocation) {
//                         OnGetLocationError();
//                 }}, 3500);
//         };
//         $scope.SubmitJobPost = function() {
//             var OnSubmitJobPostSuccess = function() {
//                 $scope.FormSubmitting = false;
//                 $location.path('/employer/dashboard')
//             };
//             var OnSubmitJobPostError = function(errors, errorMsg) {
//                 $scope.FormSubmitting = false;
//                 $scope.FormErrorMessage = errorMsg;
//                 $scope.FormError = errors;
//             };
//             $scope.FormSubmitting = true;
//             $scope.FormErrorMessage = null;
//             $scope.FormError = null;
            
//             StreamHireAPI.SendJobPost($scope.Jobpost, OnSubmitJobPostSuccess, OnSubmitJobPostError);
//         };

//         AccountAPI.deffered.promise.then(function() {
//             if(!AccountAPI.Account) {
//                 StreamHireAPI.BumpToLogin('employer', true);
//             }
//             else if(AccountAPI.Account.jobseeker) {
//                 StreamHireAPI.BumpHome();
//             }
//         });

//         //initialization
//         $scope.StaticAPI = StaticAPI;
//         $scope.FormError = null;
//         $scope.FormErrorMessage = null;
//         $scope.FormSubmitting = false;
//         $scope.Jobpost = {
//             location : {
//                 name: '',
//                 lat: null,
//                 lon: null
//             },
//             jobfunction : 0,
//             jobtype : 0,
//             employer : '',
//             title : '',
//             description : '',
//             availability : StaticAPI.GetFullAvailability(),
//             applicationtype : false,
//             externalurl : ''
//         };
//         $scope.LocationAvailable = true;
//         $scope.GettingLocation = false;
//         $scope.LoadingLocationMessage = null;
//     }]);
//     app.controller('EmployerRegistrationController', ['$scope', 'StaticAPI', 'AccountAPI', 'StreamHireAPI', function($scope, StaticAPI, AccountAPI, StreamHireAPI) {
//         $scope.OnForgotPassword = function() {
//             var OnForgotPasswordSuccess = function() {
//                 $scope.HideForgotPasswordButton = true;
//                 $scope.ForgotPasswordSubmitting = false;
//                 $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
//             };
//             var OnForgotPasswordError = function(errorMessage) {
//                 $scope.ForgotPasswordSubmitting = false;
//                 $scope.ForgotPasswordMessage = errorMessage;
//             };
//             $scope.ForgotPasswordSubmitting = true;
//             AccountAPI.OnForgotPassword($scope.Registration.account.email, OnForgotPasswordSuccess, OnForgotPasswordError);
//         };
//         $scope.OnSubmitRegistration = function() {
//             var OnSubmitRegistrationSuccess = function() {
//                 $scope.RegistrationSubmitting = false;
//                 $scope.OnComplete('registration');
//             };
//             var OnSubmitRegistrationError = function(errors, errorMessage) {
//                 $scope.RegistrationError  = errors;
//                 $scope.RegistrationErrorMessage = errorMessage;
//                 $scope.RegistrationSubmitting = false;
//             };

//             $scope.RegistrationError = null;
//             $scope.RegistrationErrorMessage = null; 
//             $scope.RegistrationSubmitting = true;
//             AccountAPI.Register('employer', $scope.Registration, OnSubmitRegistrationSuccess, OnSubmitRegistrationError);   
//         };
//         $scope.OnSubmitLogin = function() {
//             var OnSubmitLoginSuccess = function() {
//                 $scope.LoginSubmitting = false;
//                 $scope.OnComplete('login');
//             };
//             var OnSubmitLoginError = function(errors, errorMessage) {
//                 $scope.LoginError  = errors;
//                 $scope.LoginErrorMessage = errorMessage;
//                 $scope.LoginSubmitting = false;
//             };

//             $scope.LoginError  = null;
//             $scope.LoginErrorMessage = null;
//             $scope.LoginSubmitting = true;
//             AccountAPI.Login('employer', $scope.Login, OnSubmitLoginSuccess, OnSubmitLoginError);   
//         };
//         $scope.OnComplete = function(type) {
//             StreamHireAPI.OnCompletedLogin('employer');
//         };

//         AccountAPI.deffered.promise.then(function() {
//             if(AccountAPI.Account && AccountAPI.Account.jobseeker)
//             {
//                 StreamHireAPI.BumpHome();
//             }
//         });

//         //setup
//         $scope.StaticAPI = StaticAPI;

//         //forgot password UI
//         $scope.HideForgotPasswordButton = false;
//         $scope.ForgotPasswordSubmitting = false;
//         $scope.ForgotPasswordMessage = null;

//         //registration UI
//         $scope.RegistrationError = null;
//         $scope.RegistrationErrorMessage = null; 
//         $scope.RegistrationSubmitting = false;
//         //registration DATA
//         $scope.Registration = {
//             account : {
//                 name : '',
//                 phone : '',
//                 email : '',
//                 password : ''
//             },
//             name : '',
//             website : '',
//             description : ''
//         };

//         //login UI
//         $scope.LoginError  = null;
//         $scope.LoginErrorMessage = null;
//         $scope.LoginSubmitting = false;
//         //login DATA
//         $scope.Login = {
//             email : '',
//             password : ''
//         };
//     }]);
//     app.controller('JobPostViewCtrl', 
//         ['SHUtility' , 'StaticAPI', '$scope', '$window', '$location', '$routeParams', 'AccountAPI', 'StreamHireAPI',
//         function(SHUtility, StaticAPI, $scope, $window, $location, $routeParams, AccountAPI, StreamHireAPI){
//         $scope.SHUtility = SHUtility;
//         $scope.StaticAPI = StaticAPI;
//         $scope.Application = {
//             jobid : parseInt($routeParams.id),
//             name : '',
//             email : '',
//             phone : '',
//             resume : '',
//             availability :  StaticAPI.GetFullAvailability(),
//             availability_hours : null
//         };
//         $scope.ApplicationError = null;
//         $scope.ApplicationErrorMessage = null;
//         $scope.ApplicationSubmitting = false;
//         $scope.ShowApplication = false;
//         $scope.ShowApplicationSuccess = false;
//         $scope.OnApply = function() {
//             if($scope.Job.externalurl && $scope.Job.externalurl.length > 0)
//             {
//                 $window.open($scope.Job.externalurl);
//             }
//             else
//             {
//                 $scope.ShowApplication = true;
//             }
//         };

//         $scope.OnSubmitApplication = function() {
//             var OnSubmitApplicationError = function(errors, errmsg) {
//                 $scope.ApplicationError = errors;
//                 $scope.ApplicationErrorMessage = errmsg;
//                 $scope.ApplicationSubmitting = false;
//             };
//             var OnSubmitApplicationSuccess = function() {
//                 $scope.Job.applied = true;
//                 $scope.ShowApplication = false;
//                 $scope.ShowApplicationSuccess = true;
//                 $scope.ApplicationSubmitting = false;
//             }
//             $scope.ApplicationError = null;
//             $scope.ApplicationErrorMessage = null;
//             $scope.ApplicationSubmitting = true;
//             StreamHireAPI.SubmitJobApplication($scope.Application, OnSubmitApplicationSuccess, OnSubmitApplicationError);          
//         };

//         $scope.Load = function() {
//             var OnLoadSucccess = function(job) {
//                 $scope.Job = job;
//                 $scope.LoadingJobPost = false;
//             };

//             var OnLoadError = function(error) {
//                 $scope.JobLoadError = error;
//             }
//             $scope.JobLoadError = null;
//             $scope.LoadingJobPost = true;
//             console.log('loading ');
//             console.log($scope.JobId);
//             console.log($scope.Availability);
//             StreamHireAPI.LoadJobForUserView($scope.Application.jobid, $scope.Application.availability, OnLoadSucccess, OnLoadError);
//         };

//         $scope.OnClickBack = function() {
//             $window.history.back();
//         };

//         AccountAPI.deffered.promise.then(function() {
//             console.log($location.search());
//             //setup availability
//             if($routeParams.search === 'search') {
//                 $scope.Application.availability = SearchAPI.GetCopyOfAvailability(SearchAPI.SearchParams.availability);
//             }
//             else if(AccountAPI.Account && AccountAPI.Account.jobseeker) {
//                 $scope.Application.availability = SearchAPI.GetCopyOfAvailability(AccountAPI.Account.jobseeker.availability);
//             }

//             //setup application form
//             if(AccountAPI.Account && AccountAPI.Account.jobseeker) {
//                 $scope.Application.name = AccountAPI.Account.account.name;
//                 $scope.Application.email = AccountAPI.Account.account.email;
//                 $scope.Application.phone = AccountAPI.Account.account.phone;
//                 $scope.Application.resume = AccountAPI.Account.jobseeker.resume;            
//             }
//             $scope.Load();
//         });
//     }]);
//     app.controller('JobPostCandidateSeekerController', 
//         ['$scope', 
//         function($scope) {
//     }]);
//     app.controller('JobSeekerRegistrationController', ['$scope', 'StaticAPI', 'AccountAPI', 'LocationAPI', 'StreamHireAPI', function($scope, StaticAPI, AccountAPI, LocationAPI, StreamHireAPI) {   
//         $scope.OnForgotPassword = function() {
//             var OnForgotPasswordSuccess = function() {
//                 $scope.HideForgotPasswordButton = true;
//                 $scope.ForgotPasswordSubmitting = false;
//                 $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
//             };
//             var OnForgotPasswordError = function(errorMessage) {
//                 $scope.ForgotPasswordSubmitting = false;
//                 $scope.ForgotPasswordMessage = errorMessage;
//             };

//             $scope.LoginError  = null;
//             $scope.LoginErrorMessage = null;
//             $scope.ForgotPasswordSubmitting = true;
//             AccountAPI.OnForgotPassword($scope.Registration.account.email, OnForgotPasswordSuccess, OnForgotPasswordError);
//         };
//         $scope.OnSubmitRegistration = function() {
//             var OnSubmitRegistrationSuccess = function() {
//                 $scope.RegistrationSubmitting = false;
//                 $scope.OnComplete('registration');
//             };
//             var OnSubmitRegistrationError = function(errors, errorMessage) {
//                 $scope.RegistrationError  = errors;
//                 $scope.RegistrationErrorMessage = errorMessage;
//                 $scope.RegistrationSubmitting = false;
//             };

//             $scope.RegistrationError = null;
//             $scope.RegistrationErrorMessage = null; 
//             $scope.RegistrationSubmitting = true;
//             AccountAPI.Register('jobseeker', $scope.Registration, OnSubmitRegistrationSuccess, OnSubmitRegistrationError);   
//         };
//         $scope.OnSubmitLogin = function() {
//             var OnSubmitLoginSuccess = function() {
//                 $scope.LoginSubmitting = false;
//                 $scope.OnComplete('login');
//             };
//             var OnSubmitLoginError = function(errors, errorMessage) {
//                 $scope.LoginError  = errors;
//                 $scope.LoginErrorMessage = errorMessage;
//                 $scope.LoginSubmitting = false;
//             };

//             $scope.LoginError  = null;
//             $scope.LoginErrorMessage = null;
//             $scope.LoginSubmitting = true;
//             AccountAPI.Login('jobseeker', $scope.Login, OnSubmitLoginSuccess, OnSubmitLoginError);   
//         };

//         $scope.OnComplete = function(type) {
//             StreamHireAPI.OnCompletedLogin('jobseeker');
//         };

//         AccountAPI.deffered.promise.then(function() {
//             if(AccountAPI.Account && AccountAPI.Account.employer)
//             {
//                 StreamHireAPI.BumpHome();
//             }
//         });

//         $scope.StaticAPI = StaticAPI;

//         //forgot password UI
//         $scope.HideForgotPasswordButton = false;
//         $scope.ForgotPasswordSubmitting = false;
//         $scope.ForgotPasswordMessage = null;

//         //registration UI
//         $scope.RegistrationError = null;
//         $scope.RegistrationErrorMessage = null; 
//         $scope.RegistrationSubmitting = false;
//         //registration DATA
//         $scope.Registration = {
//             location : {
//                 name: '',
//                 lat: 0,
//                 lon: 0
//             },
//             account : {
//                 name : '',
//                 phone : '',
//                 email : '',
//                 password : '',
//             },
//             distance : 0,
//             resume : '',
//             availability : StaticAPI.GetFullAvailability(),
//             jobtypes : [],
//             jobfunctions : []
//         };

//         //login UI
//         $scope.LoginError  = null;
//         $scope.LoginErrorMessage = null;
//         $scope.LoginSubmitting = false;
//         //login DATA
//         $scope.Login = {
//             email : '',
//             password : ''
//         };

//         $scope.LocationAvailable = true;
//         $scope.GettingLocation = false;
//         $scope.LoadingLocationMessage = null;

//         $scope.DisableLocation = function() {
//             $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
//             $scope.GettingLocation = false;
//             $scope.LocationAvailable = false;
//         };

//         $scope.OnGetLocation = function() {
//             var msgLocationUnavailable = 'Sorry location is unavailable - please enter a postal code.';
//             var OnGetLocationSuccess = function(position) {
//                 $scope.$apply(function() {
//                     $scope.GettingLocation = false;
//                     $scope.LoadingLocationMessage = null;
//                     $scope.Registration.location.name = 'Current';
//                     $scope.Registration.location.lat = position.coords.latitude;
//                     $scope.Registration.location.lon = position.coords.longitude;
//                 });
//             };
//             var OnGetLocationError = function(error) {
//                 $scope.$apply(function(){
//                     $scope.GettingLocation = false;
//                     $scope.DisableLocation();
//                 });
//             };
//             $scope.GettingLocation = true;
//             $scope.LoadingLocationMessage = 'Loading location...';
//             LocationAPI.GetLocation(OnGetLocationSuccess, OnGetLocationError);
//             setTimeout(function(){
//                     if($scope.GettingLocation) {
//                         $scope.OnGotLocationError();
//                 }}, 3500);
//         };
//     }]);
//     app.controller('JobSeekerDashboardCtrl', ['SHUtility', '$scope', '$location', 'StreamHireAPI', function(SHUtility, $scope, $location, StreamHireAPI){
        


//         $scope.OnFindJobs = function() {
//             $location.path("/");
//         };

//         $scope.OnShowJobs = function(type) {
//             $scope.Load(1, type);
//         };

//         $scope.IsJobs = function(type) {
//             return $scope.JobTypes === type;
//         };

//         $scope.Load = function(page, type) {
//             if(!$scope.FirstLoad && $scope.JobTypes === type && $scope.Page === page) {
//                 return;
//             }
//             $scope.FirstLoad = true;
//             var OnLoadSuccess = function(my_jobs) {
//                 $scope.Page = page;
//                 $scope.JobTypes = type;
//                 $scope.MyJobs = my_jobs;
//             };
//             var OnLoadError = function() {
//                 console.log("Error loading page");
//             };

//             var data = {
//                 page : page,
//                 type : type
//             };
//             StreamHireAPI.LoadJobSeekerDashboard(data, OnLoadSuccess, OnLoadError);
//         }; 

//         $scope.OnPrevPage = function() {
//             $scope.Load($scope.Page - 1, $scope.JobTypes);
//         };

//         $scope.OnNextPage = function() {
//             $scope.Load($scope.Page + 1, $scope.JobTypes);
//         };

//         //setup ---------------------------------------------------------
//         $scope.FirstLoad = true;
//         $scope.Page = 1;
//         $scope.JobTypes = 'Applied';
//         $scope.MyJobs = {
//             total_applied : 0,
//             total_invitations : 0,
//             jobs : {
//                 type : 'Applied',
//                 start : 0,
//                 end : 0,
//                 total : 0,
//                 items : null
//             }
//         };
//         $scope.Load($scope.Page, $scope.JobTypes);
//     }])
// app.service('StreamHireAPI', ['$http', '$location', function($http, $location) {
//     this.Redirect = null;
//     var that = this;

//     this.LoadJobForUserView = function(id, availability, onSuccess, onError) {
//         //onSuccess(job)
//         //onError(errmsg)
//         var config = {
//             method: 'POST',
//             url: '/rogue/get_jobpost.php',
//             data: {
//                 jobid : id,
//                 availability : availability
//             }
//         };
//         var failMsg = "Sorry, this jobpost is unavailable. Please try again later.";
//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             console.log(data);
//             if(!data.ok) {
//                 if(onError) {
//                     onError(failMsg);
//                 }
//             }
//             else {
//                 if(onSuccess) {
//                     onSuccess(data.result);
//                 }
//                 else
//                 {
//                     onError(failMsg);
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError(failMsg);
//             }
//         });
//     };

//     this.SubmitJobApplication = function(application, onSuccess, onError) {
//         //onSuccess()
//         //onError(errors, errmsg)
//         var config = {
//             method: 'POST',
//             url: '/rogue/submit_jobapplication.php',
//             data: application
//         };

//         var failMsg = "Sorry, you application could not be submitted. Please try again later.";
//         var errorMsg = "Your application had some problems. Please check and submit again.";

//         $promise = $http(config);
//         console.log($promise);
//         $promise.success(function(data, status, headers, config) {
//             if(!data.ok) {
//                 if(onError) {
//                     onError(null, failMsg);
//                 }
//             }
//             else {
//                 if(data.result.errors) {
//                     onError(data.result.errors, errorMsg);
//                 }
//                 else {
//                     if (onSuccess) {
//                         onSuccess();
//                     }
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError(null, failMsg);
//             }
//         });
//     };
//     this.GetLocation = function(code, onSuccess) {
//         var OnLocationFromDBSuccess = function(name, lat, lon) {
//             console.log("got db location");
//             onSuccess(name, lat, lon);
//         };
//         var OnLocationFromDBError = function() {
//             var OnLocationFromGoogleSuccess = function(name, lat, lon) {
//                 console.log("got google location");
//                 onSuccess(name, lat, lon);
//             };
//             var OnLocationFromGoogleError = function() {
//                 console.log("got papa roached");
//                 onSuccess(name, 0, 0);          //last resort
//             };

//             that.GetLocationFromGoogle(code, OnLocationFromGoogleSuccess, OnLocationFromGoogleError);
//         }
//         this.GetLocationFromDB(code, OnLocationFromDBSuccess, OnLocationFromDBError);
//     }

//     this.GetLocationFromGoogle = function(code, onSuccess, onError) {
//         //onSuccess(name, lat, lon);
//         //onError
//         var config = {
//             url : 'https://maps.googleapis.com/maps/api/geocode/json',
//             params :  {
//                 address : code
//             }
//         };
//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             if(data.status === "OK") {
//                 onSuccess(code, data.results[0].geometry.location.lat, data.results[0].geometry.location.lon);
//             } 
//             else {
//                 if(onError) {
//                     onError();
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError();
//             }
//         });
//     }

//     this.GetLocationFromDB = function(code, onSuccess, onError) {
//         //onSuccess(name, lat, lon)
//         //onError() 
//         var config = {
//             method: 'POST',
//             url: '/rogue/get_location.php',
//             data: {
//                 location : code
//             }
//         };
//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             console.log(data);
//             if(!data.ok || !data.result)
//             {
//                 if(onError) {
//                     onError();
//                 }
//             }
//             else
//             {
//                 if(onSuccess) {
//                     onSuccess(data.result.name, data.result.lat, data.result.lon);
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError();
//             }
//         });
//     };

//     this.BumpHome = function(type) {
//         if(type === 'employer') {
//             $location.path('/employer/dashboard');
//         }
//         else if(type === 'jobseker')
//         {
//             $location.path('/jobseeker/dashboard');
//         }
//         else {
//             $location.path('/');
//         }
//     };

//     this.OnCompletedLogin = function(type) {
//         if(this.Redirect) {
//             $location.path(this.Redirect);
//         }
//         else {
//             this.BumpHome(type);
//         }
//     };

//     this.BumpToLogin = function(type, redirect) {
//         if(redirect) {
//             this.Redirect = $location.path();
//         }
//         if(type === 'employer') {
//             $location.path('/registration/employer');
//         }
//         else if(type === 'jobseeker') {
//             $location.path('/registration/jobseeker');
//         }
//     };

//     this.SendJobPost = function(data, onSuccess, onError) {
//         //onSuccess()
//         //onError(errors, msg) 
//         var config = {
//             method: 'POST',
//             url: '/rogue/create_jobpost.php',
//             data: data
//         };
//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             console.log(config);
//             console.log(data);
//             if(!data.ok)
//             {
//                 if(onError) {
//                     onError(data.result.errors, 'Your submission could not be made. Please try again later.');
//                 }
//             }
//             else
//             {
//                 if(data.result.errors)
//                 {
//                     if(onError) {
//                         onError(data.result.errors, 'Your job post had some problem(s). Please check and resubmit.');
//                     }
//                 }
//                 else
//                 {
//                     if(onSuccess) {
//                         onSuccess();
//                     }
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             console.log('FAIL - failed to create jobpost');
//             if(onError) {
//                 onError(null, 'Your submission could not be made. Please try again later.');
//             }
//         });
//     };
//     this.LoadJobSeekerDashboard = function(data, onSuccess, onError) {
//         var config = {
//             method: 'POST',
//             data : data,
//             url : '/rogue/get_seekerjobs.php'
//         };
//         console.log("LoadJobSeekerDashboard");
//         console.log(config);
//         var promise = $http(config);
//         promise.success(function(data, status, headers, config) {
//             console.log('StreamHireAPI.LoadJobSeekerDashboard.success...');
//             console.log(data);
//             if(!data.ok) {
//                 console.log('NOT OK');
//                 if(onError) {
//                     onError();
//                 }
//             }
//             else {
//                 if(onSuccess) {
//                     onSuccess(data.result);
//                 }
//             }
//         });
//         promise.error(function(data, status, headers, config) {
//             console.log('StreamHireAPI.LoadJobSeekerDashboard.error...');
//             console.log(status);
//             if(onError) {
//                 onError();
//             }
//         }); 
//     };
//     this.LoadJobPost = function(data, onSuccess, onError) {
//         var config = {
//             method: 'POST',
//             data : data,
//             url : '/rogue/get_jobpost.php'
//         };
//         console.log("LoadJobPost");
//         console.log(config);
//         var promise = $http(config);
//         promise.success(function(data, status, headers, config) {
//             console.log('StreamHireAPI.LoadJobPost.success...');
//             console.log(data);
//             if(!data.ok) {
//                 console.log('NOT OK');
//                 if(onError) {
//                     onError();
//                 }
//             }
//             else {
//                 if(!data.result)
//                 {
//                     return;
//                 }

//                 if(onSuccess) {
//                     onSuccess(data.result);
//                 }
//             }
//         });
//         promise.error(function(data, status, headers, config) {
//             console.log('StreamHireAPI.LoadJobPost.error...');
//             console.log(status);
//             if(onError) {
//                 onError();
//             }
//         }); 
//     };
//     this.GetEmployerJobPosts = function(page, onSuccess, onError){
//         //onSuccess(data)
//         //onError(reason)
//         var config = {
//             method: 'POST',
//             url: '/rogue/get_jobposts.php',
//             data: {
//                 page : page
//             }
//         };

//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             if(!data.ok) {
//                 if(onError) {
//                     onError(data.result);
//                 }
//             }
//             else {
//                 if(onSuccess) {
//                     onSuccess(data.result);
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError("HTTP_FAIL");
//             }
//         });
//     };
//     this.RemoveEmployerJobPost = function(id, onSuccess, onError) {
//         // onSuccess({expired : true, expire_days : 2})
//         // onError(errortype)
//         var config = {
//             method: 'POST',
//             url: '/rogue/remove_post.php',
//             data: {
//                 jobid : id
//             }
//         };
//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             if(!data.ok) {
//                 if(onError) {
//                     onError(data.result);
//                 }
//             }
//             else {
//                 if(onSuccess) {
//                     onSuccess(data.result);
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError("HTTP_FAIL");
//             }
//         });
//     };
//     this.ExtendEmployerJobPost = function(id, onSuccess, onError) {
//         // onSuccess()
//         // onError(error)
//         var config = {
//             method: 'POST',
//             url: '/rogue/extend_post.php',
//             data: {
//                 jobid : id
//             }
//         };

//         $promise = $http(config);
//         $promise.success(function(data, status, headers, config) {
//             if(!data.ok) {
//                 if(onError) {
//                     onError(data.result);
//                 }
//             }
//             else {
//                 if(onSuccess) {
//                     onSuccess();
//                 }
//             }
//         });
//         $promise.error(function(data, status, headers, config) {
//             if(onError) {
//                 onError("HTTP_FAIL");
//             }
//         });
//     };
// }]);


//-------------------------------------------------
//controllers--------------------------------------
//-------------------------------------------------
app.controller('JobSearchHomeCtrl', 
    ['MagicMikeService', 'SHUtility', 'StaticAPI', 'LocationAPI', '$scope', '$q', 
    function(MagicMikeService, SHUtility, StaticAPI, LocationAPI, $scope, $q){
    $scope.DoSearch = function() {
        MagicMikeService.RouteToJobSearchResults($scope.SearchParams.availability, $scope.SearchParams.location.name, $scope.SearchParams.location.lat, $scope.SearchParams.location.lon, $scope.SearchParams.page);
    };
    $scope.OnPostJob = function() {
        MagicMikeService.RouteToEmployerJob();
    };

    $scope.TryLoadLocationForPostalCode = function() {
        var deferred = $q.defer();

        var location = SHUtility.GetPostalCodeFromLocation($scope.SearchParams.location.name);
        var location_len = location.length;

        if(location_len < 1) {
            deferred.reject();
        }
        else if(!($scope.SearchParams.location.lat && $scope.SearchParams.location.lon)) {
            LocationAPI.GetLocationForPostalCode(location).then(
                function(result) {
                    $scope.SearchParams.location.lat = result.lat;
                    $scope.SearchParams.location.lon = result.lon;
                    deferred.resolve();
                },
                null);
        }
        else
        {
            deferred.resolve();
        }
        return deferred.promise;
    };

    $scope.OnSearch = function() {
        $scope.SearchErrors = null;
        $scope.PerformingSearch = true;
        var availability_valid = StaticAPI.IsAvailabilityValid($scope.SearchParams.availability);
        var missing_availability = 'Please enter your availability';
        $scope.TryLoadLocationForPostalCode().then(
            function() {
                if(availability_valid) {
                    $scope.DoSearch();
                }
                else {
                    $scope.ShowSearchError('availability', missing_availability);
                }
                $scope.PerformingSearch = false;
            },
            function() {
                $scope.ShowSearchError('location', 'Please enter your postal code');
                if(!availability_valid) {
                    $scope.ShowSearchError('availability', missing_availability);
                }
                $scope.PerformingSearch = false;
            })
    };

    $scope.ShowSearchError = function(key, error) {
        if(!$scope.SearchErrors) {
            $scope.SearchErrors = {};
        }
        $scope.SearchErrors[key] = error;
    };
    $scope.DisableLocation = function() {
        $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
        $scope.GettingLocation = false;
        $scope.LocationAvailable = false;
    };
    $scope.OnGetLocation = function() {
        $scope.GettingLocation = true;
        $scope.LoadingLocationMessage = 'Loading location...';

        LocationAPI.GetGeolocation().then(
            function(result) {
                $scope.GettingLocation = false;
                $scope.LoadingLocationMessage = null;
                $scope.SearchParams.location.name = 'Current';
                $scope.SearchParams.location.lat = result.lat;
                $scope.SearchParams.location.lon = result.lon;
            },
            function(error) {
                $scope.GettingLocation = false;
                $scope.DisableLocation();
            });
    };

    $scope.StaticAPI = StaticAPI;

    $scope.SearchErrors = null; 
    $scope.SearchParams = StaticAPI.GetEmptySearchParams();
    $scope.LocationAvailable = true;
    $scope.GettingLocation = false;
    $scope.LoadingLocationMessage = null;
    $scope.PerformingSearch = false;
}]);

app.controller('JobSearchResultsCtrl', 
    ['MagicMikeService', 'SHUtility', 'StaticAPI', 'LocationAPI', '$scope', '$location', '$anchorScroll', '$q', 
    function(MagicMikeService, SHUtility, StaticAPI, LocationAPI, $scope, $location, $anchorScroll, $q){

    $scope.ToggleSearchParamsExpanded = function() {
        $scope.SearchParamsExpanded = !$scope.SearchParamsExpanded;   
    }
    //load results
    $scope.Load = function(is_new_search) {
        $scope.Loading = true;
        if(is_new_search) {
            $scope.CurrentSearchParams = angular.copy($scope.SearchParams);
        }
        $scope.UpdateURLSearchParams();
        MagicMikeService.PerformSearch($scope.CurrentSearchParams).then(
            function(result) {
                $scope.SearchResults = result;
                $scope.Loading = false;
                if($scope.SearchResults.total === 0 || $scope.SearchResults.end === $scope.SearchResults.total) {
                    $scope.SearchParamsExpanded = true;
                }
                else
                {
                    $scope.SearchParamsExpanded = false;
                }
            },
            function(errResult) {
                $scope.SearchResults = StaticAPI.GetEmptySearchResults();
                $scope.Loading = false;
                $scope.SearchParamsExpanded = true;
            });
    }
    $scope.UpdateURLSearchParams = function() {
        MagicMikeService.SearchToJobSearchResults(
            $scope.CurrentSearchParams.availability,
            $scope.CurrentSearchParams.location.name,
            $scope.CurrentSearchParams.location.lat,
            $scope.CurrentSearchParams.location.lon,
            $scope.CurrentSearchParams.page);
    }
    $scope.ShowSearchError = function(key, error) {
        if(!$scope.SearchErrors) {
            $scope.SearchErrors = {};
        }
        $scope.SearchErrors[key] = error;
    };
    $scope.ShouldLoadPostalCode = function() {
        var not_changed = false;
        if($scope.CurrentSearchParams === null) {
            not_changed = true;
        }
        else {
            if($scope.SearchParams.location.name != $scope.CurrentSearchParams.location.name ||
                $scope.SearchParams.location.lat != $scope.CurrentSearchParams.location.lat ||
                $scope.SearchParams.location.lon != $scope.CurrentSearchParams.location.lon) {
                $scope.SearchParams.location.lat = null;
                $scope.SearchParams.location.lon = null;
            }
            not_changed = true;

        }
        return not_changed;
    };

    $scope.TryLoadLocationForPostalCode = function() {
        var deferred = $q.defer();

        var location = SHUtility.GetPostalCodeFromLocation($scope.SearchParams.location.name);
        var location_len = location.length;

        if(location_len < 1) {
            deferred.reject();
        }
        else if($scope.ShouldLoadPostalCode()) {
            LocationAPI.GetLocationForPostalCode(location).then(
                function(result) {
                    $scope.SearchParams.location.lat = result.lat;
                    $scope.SearchParams.location.lon = result.lon;
                    deferred.resolve();
                },
                null);
        }
        else
        {
            deferred.resolve();
        }
        return deferred.promise;
    };

    $scope.OnSearch = function() {
        $scope.SearchErrors = null;
        $scope.Loading = true;
        var availability_valid = StaticAPI.IsAvailabilityValid($scope.SearchParams.availability);
        var missing_availability = 'Please enter your availability';
        $scope.TryLoadLocationForPostalCode().then(
            function() {
                if(availability_valid) {
                    $scope.Load(true);
                }
                else {
                    $scope.ShowSearchError('availability', missing_availability);
                }
                $scope.Loading = false;
            },
            function() {
                $scope.ShowSearchError('location', 'Please enter your postal code');
                if(!availability_valid) {
                    $scope.ShowSearchError('availability', missing_availability);
                }
                $scope.Loading = false;
            });
    }
    $scope.OnNextPage = function() {
        $scope.CurrentSearchParams.page++;
        $scope.Load(false);
    };
    $scope.OnPrevPage = function() {
        $scope.CurrentSearchParams.page--;
        $scope.Load(false);
    };

    $scope.InitSearchParams = function() {
        //load the location and availability search params from search string
        var urlparams = $location.search(); 
        var valid_location = false;
        var loc = null;
        var lat = null;
        var lon = null;
        var MAX_LOCATION_LEN = 10;
        if(urlparams.lc 
            && (typeof urlparams.lc) === 'string'
            && urlparams.lc.length >= 1 
            && urlparams.lc.length <= MAX_LOCATION_LEN)
        {
            loc = urlparams.lc;
            if(urlparams.lt)
            {
                lat = parseFloat(urlparams.lt);
                if(!isNaN(lat) && Math.abs(lat) <= 90)
                {
                    if(urlparams.ln)
                    {
                        lon = parseFloat(urlparams.ln);
                        if(!isNaN(lon) && Math.abs(lon) <= 180) {
                            valid_location = true;
                        }

                    }
                }
            }
        }
        var valid_availability = false;
        var availability = null;
        if(urlparams.a
           && (typeof urlparams.a) === 'string') {
            availability = SHUtility.ConvertStringToAvailability(urlparams.a);
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
            $scope.SearchParams.location.name = loc;
            $scope.SearchParams.location.lat = lat;
            $scope.SearchParams.location.lon = lon
            $scope.SearchParams.availability = availability;
            $scope.SearchParams.page = page;
        }

        return valid_urlsearchparams;
    }
    $scope.DisableLocation = function() {
        $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
        $scope.GettingLocation = false;
        $scope.LocationAvailable = false;
    };
    $scope.OnGetLocation = function() {
        $scope.GettingLocation = true;
        $scope.LoadingLocationMessage = 'Loading location...';

        LocationAPI.GetGeolocation().then(
            function(result) {
                $scope.GettingLocation = false;
                $scope.LoadingLocationMessage = null;
                $scope.SearchParams.location.name = 'Current';
                $scope.SearchParams.location.lat = result.lat;
                $scope.SearchParams.location.lon = result.lon;
            },
            function(error) {
                $scope.GettingLocation = false;
                $scope.DisableLocation();
            });
    };

    $scope.NoResults = function() {
        return $scope.SearchResults.total === 0;
    };

    $scope.SearchErrors = null;
    //setup libs used in UI
    $scope.StaticAPI = StaticAPI;
    $scope.SHUtility = SHUtility;
    //search param setup
    $scope.SearchResults = StaticAPI.GetEmptySearchResults();
    $scope.SearchParams = StaticAPI.GetEmptySearchParams();
    $scope.CurrentSearchParams = null;
    if($scope.InitSearchParams()) {
        $scope.Load(true);
    }
    $scope.SearchParams.page = 1;
    //search param div expansion
    $scope.SearchParamsExpanded = true;
    //location ---------------------------------------------------
    $scope.LocationAvailable = true;
    $scope.GettingLocation = false;
    $scope.LoadingLocationMessage = null;
}]);

app.controller('JobPostViewCtrl', 
    ['SHUtility' , 'StaticAPI', '$scope', '$location', '$window', '$routeParams', 'AccountAPI', 'MagicMikeAPI', 'MagicMikeService',
    function(SHUtility, StaticAPI, $scope, $location, $window, $routeParams, AccountAPI, MagicMikeAPI, MagicMikeService){

    $scope.Loading = true;
    $scope.LoadingError = false;

    $scope.SHUtility = SHUtility;
    $scope.StaticAPI = StaticAPI;

    $scope.Availability = null;
    $scope.JobId = null;
    $scope.Job = null;

    $scope.Application = StaticAPI.GetEmptyApplication();
    $scope.ApplicationError = null;
    $scope.ApplicationErrorMessage = null;
    $scope.ApplicationSubmitting = false;
    $scope.PermitApplication = true;
    $scope.ShowApplication = false;
    $scope.ShowApplicationSuccess = false;

    $scope.InitApplication = function() {
        if(AccountAPI.IsJobseeker()) {
            $scope.Application.jobid = $scope.Job.id;
            $scope.Application.name = AccountAPI.Account.account.name;
            $scope.Application.email = AccountAPI.Account.account.email;
            $scope.Application.phone = AccountAPI.Account.account.phone;
            $scope.Application.resume = AccountAPI.Account.jobseeker.resume;
            $scope.Application.availability = $scope.Availability;
        }
        else if(AccountAPI.IsEmployer()) {
            $scope.PermitApplication = false;
        }
    };

    $scope.InitJob = function() {
        var urlparams = $location.search();

        var valid_job = false;
        var jobid = null;
        if(urlparams.i) {
            jobid = parseInt(urlparams.i);
            if(!isNaN(jobid)) {
                valid_job = true;
            }
        }
        if(!valid_job) {
            return false;
        }
        $scope.JobId = jobid;

        var valid_availability = false;
        var availability = null;
        if(urlparams.a
           && (typeof urlparams.a) === 'string') {
            availability = SHUtility.ConvertStringToAvailability(urlparams.a);
            valid_availability = (availability != null);
        }
        if(!valid_availability) {
            if(AccountAPI.IsJobseeker()) {
                availability = angular.copy(AccountAPI.Account.jobseeker.availability);
            }
            else {
                availability = StaticAPI.GetFullAvailability();
            }
        }
        $scope.Availability = availability;

        var valid_source = true;
        var source = null;
        if(urlparams.s) {
            if(urlparams.s === MagicMikeAPI.JobSourceSearch 
                || urlparams.s === MagicMikeAPI.JobSourceInvite 
                || urlparams.s === MagicMikeAPI.JobSourcePost 
                || urlparams.s === MagicMikeAPI.JobSourceApplication) {
                source = urlparams.s;
            }
            else {
                valid_source = false;
            }
        }

        return true;
    };
    $scope.LoadJob = function () {
        $scope.Loading = true;
        MagicMikeService.LoadJobForUserView($scope.JobId, $scope.Availability).then(
            function(result) {
                $scope.Job = result;
                $scope.Loading = false;
                $scope.InitApplication()
            },
            function(error) {
                $scope.LoadError = true;
                $scope.Loading = false;
            });
    };
    $scope.OnApply = function() {
        if($scope.Job.externalurl)
        {
            $window.open($scope.Job.externalurl);
        }
        else
        {
            $scope.ShowApplication = true;
        }
    };

    $scope.OnSubmitApplication = function() {
        $scope.ApplicationError = null;
        $scope.ApplicationErrorMessage = null;
        $scope.ApplicationSubmitting = true;
        MagicMikeService.SubmitJobApplication($scope.Application).then(
            function() {
                $scope.Job.applied = true;
                $scope.ShowApplication = false;
                $scope.ShowApplicationSuccess = true;
                $scope.ApplicationSubmitting = false;
            },
            function(result) {
                $scope.ApplicationError = result.errors;
                $scope.ApplicationErrorMessage = result.errmsg;
                $scope.ApplicationSubmitting = false;
            });          
    };

    $scope.OnClickBack = function() {
        $window.history.back();
    };

    if($scope.InitJob()) {
        $scope.LoadJob();
    }
    else
    {
        $scope.LoadError = true;
        $scope.Loading = false;
    }
}]);

app.controller('EmployerRegistrationController', 
    ['$scope', 'StaticAPI', 'AccountAPI', 'MagicMikeService', 'MagicMikeAPI', 
    function($scope, StaticAPI, AccountAPI, MagicMikeService, MagicMikeAPI) {
    
    $scope.OnForgotPassword = function() {
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.ForgotPasswordSubmitting = true;
        AccountAPI.ForgotPassword().then(
            function() {
                $scope.HideForgotPasswordButton = true;
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
            },
            function(error) {
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = msg;
            })
    };

    $scope.OnSubmitRegistration = function() {
        $scope.RegistrationError = null;
        $scope.RegistrationErrorMessage = null; 
        $scope.RegistrationSubmitting = true;
        AccountAPI.Register(MagicMikeAPI.Employer, $scope.Registration).then(
            function() {
                $scope.RegistrationSubmitting = false;
                MagicMikeService.RouteToEmployerDashboard();
            },
            function(result) {
                $scope.RegistrationError  = result.errors;
                $scope.RegistrationErrorMessage = result.msg;
                $scope.RegistrationSubmitting = false;                
            });
    };

    $scope.OnSubmitLogin = function() {
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.LoginSubmitting = true;
        AccountAPI.Login(MagicMikeAPI.Employer, $scope.Login).then(
            function() {
                $scope.LoginSubmitting = false;
                MagicMikeService.RouteToEmployerDashboard();
            },
            function(result) {
                $scope.LoginError  = result.errors;
                $scope.LoginErrorMessage = result.msg;
                $scope.LoginSubmitting = false;             
            });
    };

    // should we be showing this view
    if(AccountAPI.IsLoggedIn()) {
        if(AccountAPI.IsEmployer()){
            MagicMikeService.RouteToEmployerDashboard();
        }
        else {
            MagicMikeService.RouteToJobseekerDashboard();
        }
    }

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
    $scope.Registration = StaticAPI.GetEmptyEmployerRegistration();
    //login UI
    $scope.LoginError  = null;
    $scope.LoginErrorMessage = null;
    $scope.LoginSubmitting = false;
    //login DATA
    $scope.Login = StaticAPI.GetEmptyEmployerLogin();
}]);

app.controller('JobSeekerRegistrationController', 
    ['$scope', 'StaticAPI', 'AccountAPI', 'LocationAPI', 'MagicMikeService', 'MagicMikeAPI', 
    function($scope, StaticAPI, AccountAPI, LocationAPI, MagicMikeService, MagicMikeAPI) {   
    $scope.OnForgotPassword = function() {
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.ForgotPasswordSubmitting = true;
        AccountAPI.ForgotPassword().then(
            function() {
                $scope.HideForgotPasswordButton = true;
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = 'Your password reset link has been sent';
            },
            function(error) {
                $scope.ForgotPasswordSubmitting = false;
                $scope.ForgotPasswordMessage = msg;
            })
    };
    $scope.OnSubmitRegistration = function() {
        $scope.RegistrationError = null;
        $scope.RegistrationErrorMessage = null; 
        $scope.RegistrationSubmitting = true;
        AccountAPI.Register(MagicMikeAPI.Jobseeker, $scope.Registration).then(
            function() {
                $scope.RegistrationSubmitting = false;
                MagicMikeService.RouteToJobseekerDashboard();
            },
            function(result) {
                $scope.RegistrationError  = result.errors;
                $scope.RegistrationErrorMessage = result.msg;
                $scope.RegistrationSubmitting = false;                
            });
    };
    $scope.OnSubmitLogin = function() {
        $scope.LoginError  = null;
        $scope.LoginErrorMessage = null;
        $scope.LoginSubmitting = true;
        AccountAPI.Login(MagicMikeAPI.Jobseeker, $scope.Login).then(
            function() {
                $scope.LoginSubmitting = false;
                MagicMikeService.RouteToJobseekerDashboard();
            },
            function(result) {
                $scope.LoginError = result.errors;
                $scope.LoginErrorMessage = result.msg;
                $scope.LoginSubmitting = false;             
            });
    };
    $scope.DisableLocation = function() {
        $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
        $scope.GettingLocation = false;
        $scope.LocationAvailable = false;
    };
    $scope.OnGetLocation = function() {
        $scope.GettingLocation = true;
        $scope.LoadingLocationMessage = 'Loading location...';

        LocationAPI.GetGeolocation().then(
            function(result) {
                $scope.GettingLocation = false;
                $scope.LoadingLocationMessage = null;
                $scope.Registration.location.name = 'Current';
                $scope.Registration.location.lat = result.lat;
                $scope.Registration.location.lon = result.lon;
            },
            function(error) {
                $scope.GettingLocation = false;
                $scope.DisableLocation();
            });
    };

    // should we be showing this view
    if(AccountAPI.IsLoggedIn()) {
        if(AccountAPI.IsEmployer){
            MagicMikeService.RouteToEmployerDashboard();
        }
        else {
            MagicMikeService.RouteToJobseekerDashboard();
        }
    }


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
    $scope.Registration = StaticAPI.GetEmptyJobseekerRegistration();

    //login UI
    $scope.LoginError  = null;
    $scope.LoginErrorMessage = null;
    $scope.LoginSubmitting = false;
    //login DATA
    $scope.Login = StaticAPI.GetEmptyJobseekerLogin();

    $scope.LocationAvailable = true;
    $scope.GettingLocation = false;
    $scope.LoadingLocationMessage = null;
}]);

app.controller('JobPostCreateCtrl', 
    ['StaticAPI', '$scope', '$location', '$routeParams', 'AccountAPI', 'LocationAPI', 'MagicMikeService', '$q', 'SHUtility',
    function(StaticAPI, $scope, $location, $routeParams, AccountAPI, LocationAPI, MagicMikeService, $q, SHUtility) {    

    $scope.InitJob = function() {
        var urlparams = $location.search();
        var valid_jobid = false;
        var jobid  = null;
        if(urlparams.i) {
            jobid = parseInt(urlparams.i);
            if(!isNaN(jobid)) {
                console.log('should load jobid');
                $scope.Jobid = jobid;
                valid_jobid = true;
            }
        }
        if(!valid_jobid) {
            console.log('empty jobpostg');
            $scope.Jobpost = StaticAPI.GetEmptyJobpost();
            $scope.Jobpost.employer = AccountAPI.Account.employer.name;
        }
        return valid_jobid;
    };
    $scope.LoadJob = function() {
        MagicMikeService.LoadJobPostForEdit($scope.Jobid).then(
            function(result) {
                $scope.Jobpost = result;
                $scope.CurrentJobLocation = angular.copy($scope.Jobpost.location);
                $scope.Loading = false;
            },
            function(errmsg) {
                $scope.LoadingError = "Sorry that job is not available for edit.  Please try again later.";
            });
    };

    $scope.ShouldLoadPostalCode = function() {
        var not_changed = false;
        if($scope.CurrentJobLocation === null) {
            not_changed = true;
        }
        else {
            if($scope.Jobpost.location.name != $scope.CurrentJobLocation.name ||
                $scope.Jobpost.location.lat != $scope.CurrentJobLocation.lat ||
                $scope.Jobpost.location.lon != $scope.CurrentJobLocation.lon) {
                $scope.Jobpost.location.lat = null;
                $scope.Jobpost.location.lon = null;
            }
            not_changed = true;

        }
        return not_changed;
    };

    $scope.TryLoadLocationForPostalCode = function() {
        var deferred = $q.defer();

        var location = SHUtility.GetPostalCodeFromLocation($scope.Jobpost.location.name);
        var location_len = location.length;
        if(location_len < 1) {
            deferred.resolve();
        }
        else if($scope.ShouldLoadPostalCode()) {
            LocationAPI.GetLocationForPostalCode(location).then(
                function(result) {
                    $scope.Jobpost.location.lat = result.lat;
                    $scope.Jobpost.location.lon = result.lon;
                    deferred.resolve();
                },
                null);
        }
        else
        {
            deferred.resolve();
        }
        return deferred.promise;
    };


    $scope.SubmitJobPost = function() {
        $scope.FormSubmitting = true;
        $scope.FormErrorMessage = null;
        $scope.FormError = null;
        $scope.TryLoadLocationForPostalCode().then(
            function() {
                MagicMikeService.UploadJobPost($scope.Jobpost).then(
                    function() {
                        $scope.FormSubmitting = false;
                        MagicMikeService.RouteToEmployerDashboard();
                    },
                    function(result) {
                        $scope.FormSubmitting = false;
                        $scope.FormErrorMessage = result.errmsg,
                        $scope.FormError = result.errors;
                    });
            }, null);

    };
    $scope.DisableLocation = function() {
        $scope.LoadingLocationMessage = 'Sorry location is unavailable - please enter a postal code.';
        $scope.GettingLocation = false;
        $scope.LocationAvailable = false;
    };
    $scope.OnGetLocation = function() {
        $scope.GettingLocation = true;
        $scope.LoadingLocationMessage = 'Loading location...';

        LocationAPI.GetGeolocation().then(
            function(result) {
                $scope.GettingLocation = false;
                $scope.LoadingLocationMessage = null;
                $scope.Jobpost.location.name = 'Current';
                $scope.Jobpost.location.lat = result.lat;
                $scope.Jobpost.location.lon = result.lon;
            },
            function(error) {
                $scope.GettingLocation = false;
                $scope.DisableLocation();
            });
    };

    if(!AccountAPI.IsEmployer()) {
        MagicMikeService.RouteToEmployerRegistration(true);
    }

    $scope.Loading = true;
    $scope.LoadingError = null;

    $scope.Jobid = null;
    $scope.Jobpost = null; 
    $scope.CurrentJobLocation = null;

    if($scope.InitJob()) {
        $scope.LoadJob();
    }
    else
    {
        $scope.Loading = false;
    }

    //initialization
    $scope.StaticAPI = StaticAPI;
    $scope.FormError = null;
    $scope.FormErrorMessage = null;
    $scope.FormSubmitting = false;

    $scope.LocationAvailable = true;
    $scope.GettingLocation = false;
    $scope.LoadingLocationMessage = null;
}]);


app.controller('JobSeekerDashboardCtrl', 
    ['SHUtility', '$scope', '$location', 'MagicMikeService', 'MagicMikeAPI', 
    function(SHUtility, $scope, $location, MagicMikeService, MagicMikeAPI){
        
    $scope.OnFindJobs = function() {
        MagicMikeService.RouteToJobSearch();
    };

    $scope.OnShowJobs = function(type) {
        $scope.Load(1, type);
    };

    $scope.IsJobs = function(type) {
        return $scope.JobTypes === type;
    };

    $scope.Load = function(page, type) {
        MagicMikeService.LoadJobSeekerDashboard(page, type).then(
            function(result) {
                $scope.Page = page;
                $scope.JobTypes = type;
                $scope.MyJobs = result;
                $scope.Loading = false;
            },
            function(error) {
                $scope.LoadingError = error;
                $scope.Loading = false;
            });
    }; 

    $scope.OnPrevPage = function() {
     $scope.Load($scope.Page - 1, $scope.JobTypes);
    };

    $scope.OnNextPage = function() {
     $scope.Load($scope.Page + 1, $scope.JobTypes);
    };

    $scope.Init = function() {
        var urlparams = $location.search();

        var page = 1;
        if(urlparams.p) {
            var p = parseInt(urlparams.p);
            if(!isNaN(p) && p > 0) {
                page = p;
            }
        }

        var s = null;
        if(urlparams.s && (typeof urlparams.s) === 'string') {
            if(urlparams.s ===  MagicMikeAPI.JobSourceInvite || urlparams.s ===  MagicMikeAPI.JobSourceApplication) {
                s = urlparams.s;
            }
        };

        $scope.Page = page;
        $scope.JobTypes = s ? s : MagicMikeAPI.JobSourceApplication;
    };

    $scope.SHUtility = SHUtility;
    $scope.MagicMikeAPI = MagicMikeAPI;

    $scope.Loading = true;
    $scope.LoadingError = null;

    $scope.Page = null;
    $scope.JobTypes = null;
    $scope.MyJobs = null; 

    $scope.Init();
    $scope.Load($scope.Page, $scope.JobTypes);

}]);

//-------------------------------------------------
//services-----------------------------------------
//-------------------------------------------------
app.service('AccountAPI', ['$http', '$cookieStore', '$q', 'MagicMikeAPI', 'MagicMikeService', function($http, $cookieStore, $q, MagicMikeAPI, MagicMikeService) { 
    var that = this;
    this.observerCallbacks = [];

    this.IsLoggedIn = function() {
        return this.Account;
    }


    this.IsEmployer = function() {
        return this.IsLoggedIn() && this.Account.employer;
    };
    
    this.IsJobseeker = function() {
        return this.IsLoggedIn() && this.Account.jobseeker;
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
        this.Account = account;
        this.notifyObservers();
    };
    this.Logout = function() {
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.UpdateAccount(null);
        MagicMikeService.RouteToHome();
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
        return deferred.promise;
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
        return deferred.promise;
    };
    this.Load = function() {
        console.log('loading account');
        var config = {
            method: MagicMikeAPI.GET,
            url :   MagicMikeAPI.LoadAccount
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                 //something went wrong
                console.log("Failed to load account. Continue with resolve!");
                console.log(data);
            }
            else {
                that.UpdateAccount(data.result);
            }
            that.deferred.resolve();
        });
        promise.error(function(data, status, headers, config) {
            that.deferred.resolve();
        });
    };
    this.Account = null;
    this.deferred = $q.defer();
    this.promise = this.deferred.promise;
    this.Load();
    return this;
}]);
app.service('LocationAPI',
    ['$q',  'MagicMikeAPI', '$http', 'SHUtility', function($q, MagicMikeAPI, $http, SHUtility){
    var that = this;
    
    this.GetGeolocation = function() {
        var deferred = $q.defer();
        var waiting = true;
        var onSuccess = function(position) {
            deferred.resolve({lat : position.coords.latitude, lon : position.coords.longitude});
        };
        var onError = function(error) {
            deferred.reject(error);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000 });
            setTimeout(function(){ if(waiting) { onError() }}, 5500);
        }
        else {
            onError();
        }
        return deferred.promise;
    }

    this.GetLocationForPostalCode = function(loc) {
        var code = SHUtility.GetPostalCodeFromLocation(loc);
        var deferred = $q.defer();

        var onSuccess = function(result){
            deferred.resolve(result);
        };
        var onError = function(){
            deferred.resolve({lat : 0, lon : 0 });
        };
        this.GetLocationFromDB(code).then(
            onSuccess, 
            function() {
                that.GetLocationFromGoogle(code).then(onSuccess, onError);
            }
        );
        return deferred.promise;
    }

    this.GetLocationFromGoogle = function(code) {
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.GET,
            url :   MagicMikeAPI.LocationFromGoogle,
            params :  {
                address : code
            }
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(data.status === "OK") {
                deferred.resolve({lat : data.results[0].geometry.location.lat, lon : data.results[0].geometry.location.lng });
            }
            else{
                deferred.reject()
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject()
        });
        return deferred.promise;
    };

    this.GetLocationFromDB = function(code) {
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url :   MagicMikeAPI.LocationFromPostalCode,
            data: {
                location : code
            }
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok || !data.result) {
                deferred.reject()
            }
            else {
                deferred.resolve({lat : data.result.lat, lon : data.result.lon });
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject()
        });
        return deferred.promise;
    };
}]);

app.service('StaticAPI', 
    ['$http', '$q', 'MagicMikeAPI', function($http, $q, MagicMikeAPI) {
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

    this.Valid = false;

    this.GetEmptyJobseekerRegistration = function() {
        return {
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
            availability : this.GetFullAvailability(),
            jobtypes : [],
            jobfunctions : []
        };
    };

    this.GetEmptyJobpost = function() {
        return {
            id : null,
            employer : '',
            title : '',
            description : '',
            location : {
                name: '',
                lat: null,
                lon: null
            },
            jobtype : 0,
            jobfunction : 0,            
            externalurl : '',
            applicationtype : false,
            availability : this.GetFullAvailability()

        };
    };

    this.GetEmptyJobseekerLogin = function() {
        return {
            email : '',
            password : ''
        };
    };

    this.GetEmptyEmployerRegistration = function() {
        return {
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
    }
        
    this.GetEmptyEmployerLogin = function() {
        return {
            email : '',
            password : ''
        };
    };

    this.FillAvailability = function(value, availability) {
        for(var i = 0; i < this.AvailabilityDays.length; i++) {
            for(var j = 0; j < this.AvailabilityCategories.length; j++) {
                availability[i][j] = value;
            }
        }
    }

    this.GetEmptyApplication = function() {
        return {
            jobid : null,
            name : '',
            email : '',
            phone : '',
            resume : '',
            availability :  this.GetFullAvailability()
        };
    };

    this.GetEmptySearchResults = function() {
        return {
            total : 0,
            start : 0,
            end : 0,
            results : []
        }
    };

    this.GetEmptySearchParams = function() {
        return {
            keywords : '',
            availability : this.GetFullAvailability(),
            location : {
                name : '',
                lat : null,
                lon : null
            },
            page : 1
        };
    };

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

    this.IsAvailabilityValid = function(availability) {
        var has_availability = false;
        for(var i = 0; i < this.AvailabilityDays.length; i++) {
            for(var j = 0; j < this.AvailabilityCategories.length; j++) {
                if(availability && availability[i] && availability[i][j]) {
                    has_availability = true;
                    break;
                }
            }
        }
        return has_availability;
    }

   this.Load = function() {
        var config = {
            method: MagicMikeAPI.GET,
            url :   MagicMikeAPI.StaticData
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                that.deferred.reject()
            }
            else {
                that.JobFunctions = data.result.jobfunctions;
                that.JobTypes = data.result.jobtypes; 
                this.Valid = true;
                that.deferred.resolve();               
            }
        });
        promise.error(function(data, status, headers, config) {
            that.deferred.reject()   
        });
    }

    this.deferred = $q.defer();
    this.promise = this.deferred.promise;
    this.Load();
    return this;
}]);

app.service('SHUtility', 
    ['StaticAPI', function(StaticAPI){

    //DATA
    this.ConvertAvailabilityToString = function(availability) {
        var path = '' + StaticAPI.AvailabilityDays.length + StaticAPI.AvailabilityCategories.length;
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

    //DATA - postal code
    this.GetPostalCodeFromLocation = function(loc) {
        return loc.replace(/[^a-z0-9]/gi,'');
    };

    //UI - utility for some pretty strings 
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

    //UI - utility to get stars in job result for match/coverage
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

app.constant('MagicMikeAPI', {
    //----------------------_HTTP PLAYPEN_---------------------------
    //---------------------------------------------------------------
    GET : 'GET',
    POST : 'POST',
    //----------------------_ACTION TARGETS_-------------------------
    //---------------------------------------------------------------
    //.account loading
    LoadAccount : '/rogue/load_account.php',
    //.static data loading
    StaticData : '/rogue/static.php',
    //
    LocationFromPostalCode : '/rogue/get_location.php',
    LocationFromGoogle : 'https://maps.googleapis.com/maps/api/geocode/json',
    //.search
    Search : '/rogue/search.php',
    //.account login submission
    LoginEmployerAccount : '/rogue/login_employer.php',
    LoginJobseekerAccount : '/rogue/login_jobseeker.php',
    //.account registration submission
    RegisterEmployerAccount : '/rogue/register_employer.php',
    RegisterJobseekerAccount : '/rogue/register_jobseeker.php',
    //.view job post
    JobView : '/rogue/get_jobpost.php',
    //. submit job application
    JobApplication: '/rogue/submit_jobapplication.php',
    GetJobPostForEdit : '/rogue/get_jobpostforedit.php',
    UploadJobPost : '/rogue/create_jobpost.php',
    //.jobseeker dashboard
    JobseekerJobs : '/rogue/get_seekerjobs.php',
    
    //-----------------------_DEFINITIONS_---------------------------
    //---------------------------------------------------------------
    Employer : 'employer',
    Jobseeker : 'jobseeker',
    //-----------------------_JOBVIEW SOURCES_-----------------------
    //---------------------------------------------------------------
    JobSourceSearch : 's',
    JobSourceInvite : 'i',
    JobSourcePost : 'p',
    JobSourceApplication : 'a',
    //-----------------------_ROUTING_-------------------------------
    //---------------------------------------------------------------
    LocationHome :                  '/',
    LocationJobSearchResults :      '/jobs',
    LocationJobView :               '/job',
    LocationJobseekerRegistration:  '/jobseeker/registration',
    LocationJobseekerDashboard :    '/jobseeker/dash',
    LocationJobseekerProfile :      '/jobseeker/profile',
    LocationEmployerRegistration:   '/employer/registration',
    LocationEmployerDashboard :     '/employer/dash',
    LocationEmployerProfile :       '/employer/profile',
    LocationEmployerJob :           '/employer/job',
    LocationEmployerJobCandidates : '/employer/candidates',
    AccountPicker :                 '/account'
});

app.service('MagicMikeService', 
    ['$location', 'MagicMikeAPI', '$q', '$http', 'SHUtility',
    function($location, MagicMikeAPI, $q, $http, SHUtility) { 

    this.SearchToJobSearchResults = function(availability, location_name, location_lat, location_lon, page) {
        var availability_str = SHUtility.ConvertAvailabilityToString(availability);
        var searchparams = {
            a : availability_str,
            lc : location_name,
            lt : location_lat,
            ln : location_lon,
            p : page
        };
        $location.search(searchparams);
    };

    this.OnCompleteRegistration = function() {
        if(this.redirect) {
            $location.url(redirect);
        }
    };

    this.RouteToAccountPicker = function() {
        $location.url(MagicMikeAPI.AccountPicker).search(null);
    };

    this.RouteToEmployerRegistration = function(redirect) {
        this.redirect = this.redirect ? $location.url() : null;
        $location.url(MagicMikeAPI.LocationEmployerRegistration).search(null);
    };

    this.RouteToJobseekerRegistration = function(redirect) {
        this.redirect = this.redirect ? $location.url() : null;
        $location.url(MagicMikeAPI.LocationJobseekerRegistration).search(null);
    };

    this.RouteToJobSearchResults = function(availability, location_name, location_lat, location_lon, page) {
        $location.url(MagicMikeAPI.LocationJobSearchResults);
        this.SearchToJobSearchResults(availability, location_name, location_lat, location_lon, page);
    };

    this.RouteToHome = function() {
        $location.url(MagicMikeAPI.LocationHome).search(null);
    };

    this.RouteToJobSearch = function() {
        console.log("routing to jobsearch");
        $location.url(MagicMikeAPI.LocationJobSearchResults).search(null);
    };

    this.RouteToEmployerJob = function(id) {
        var params = null;
        if(id) {
            params = { id : id };
        }

        if(params) {
            $location.url(MagicMikeAPI.LocationEmployerJob).search(params);
        }
        else {
            $location.url(MagicMikeAPI.LocationEmployerJob).search(null);
        }
    };

    this.RouteToEmployerDashboard = function() {
        $location.url(MagicMikeAPI.LocationEmployerDashboard).search(null);
    };

    this.RouteToJobseekerDashboard = function() {
        $location.url(MagicMikeAPI.LocationJobseekerDashboard).search(null);
    };

    this.PerformSearch = function(searchParams) {
        var deferred = $q.defer();
        var msgError = 'Your search had some problem(s). Please check and try again.';
        var msgFailed = 'We could not perform your search right now. Please try again later.';
        var config = {
            method: MagicMikeAPI.POST,
            data : searchParams,
            url : MagicMikeAPI.Search
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                deferred.reject({errors: null, msg: msgFailed});
            }
            else if(data.result.errors) {
                deferred.reject({errors: data.result.errors, msg: msgError});
            }
            else {
                deferred.resolve(data.result);
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject({errors: null, msg: msgFailed});
        });
        return deferred.promise;
    };

    this.LoadJobSeekerDashboard = function(page, type) {
        var deferred = $q.defer();

        var failMsg = 'Sorry your dashboard is not available at the moment. Please try again later.';

        var typestr = '';
        if(type === MagicMikeAPI.JobSourceApplication) {
            typestr = 'Applied';
        }
        else if(type === MagicMikeAPI.JobSourceInvite) {
            typestr = 'Invited';
        }
        var config = {
            method: MagicMikeAPI.POST,
            data : {
                page : page,
                type : typestr
            },
            url : MagicMikeAPI.JobseekerJobs
        };
        console.log(config);
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            console.log('LoadJobSeekerDashboard');
            console.log(data);
            if(!data.ok) {
                deferred.reject(failMsg);
            }
            else {
                deferred.resolve(data.result);
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject(failMsg);
        }); 

        return deferred.promise;
    };

    this.SubmitJobApplication = function(application) {
        var deferred = $q.defer();

        var failMsg = "Sorry, you application could not be submitted. Please try again later.";
        var errorMsg = "Your application had some problems. Please check and submit again.";

        var config = {
            method: MagicMikeAPI.POST,
            url: MagicMikeAPI.JobApplication, 
            data: application
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                deferred.reject({errors: null, errmsg : failMsg});
            }
            else if(data.result.errors){
                deferred.reject({errors: data.result.errors, errmsg : errorMsg});
            }
            else {
                deferred.resolve();
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject({errors: null, errmsg : failMsg});
        });

        return deferred.promise;
    };

    this.LoadJobPostForEdit = function(id) {
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url: MagicMikeAPI.GetJobPostForEdit, 
            data: {
                jobid : id
            }
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            console.log(data);
            if(!data.ok) {
                if(data.result === 'INVALID_EDITPOST_INVALIDJOB') {
                    deferred.reject('Sorry that is not a valid job post.');
                }
                else if(data.result === 'INVALID_EDITPOST_EXPIRED') {
                    deferred.reject('Sorry that jobpost is already expired, it cannot be updated.');
                }
                else {
                    deferred.reject('Sorry that jobpost is not available. Please try again later');
                }
            }
            else {
                deferred.resolve(data.result);
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject('Sorry that jobpost is not available. Please try again later');
        });
        return deferred.promise;
    };

    this.UploadJobPost = function(jobpost) {
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url: MagicMikeAPI.UploadJobPost, 
            data: jobpost
        };
        var promise = $http(config);
        promise.success(function(data, status, headers, config) {
            if(!data.ok) {
                if(data.result === 'INVALID_EDITPOST_INVALIDJOB') {
                    deferred.reject({errors: null, errmsg : 'Sorry that is not a valid job post.'});
                }
                else if(data.result === 'INVALID_EDITPOST_EXPIRED') {
                    deferred.reject({errors: null, errmsg : 'Sorry that jobpost is already expired, it cannot be updated.'});
                }
                else{
                    deferred.reject({errors: null, errmsg : 'Sorry that jobpost is not available. Please try again later'});
                }
            }
            else if(data.result.errors){
                deferred.reject({errors: data.result.errors, errmsg : 'Your submission had some errors, please check and resubmit.'});
            }
            else {
                deferred.resolve();
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject({errors: null, errmsg : 'Sorry that jobpost is not available. Please try again later'});
        });
        return deferred.promise;
    };

    this.LoadJobForUserView = function(id, availability) {
        var deferred = $q.defer();
        var config = {
            method: MagicMikeAPI.POST,
            url: MagicMikeAPI.JobView,
            data: {
                jobid : id,
                availability : availability
            }
        };
        var promise = $http(config);
        console.log('LoadJobForUserView');
        console.log(config);
        promise.success(function(data, status, headers, config) {
            console.log(data);
            if(!data.ok) {
                deferred.reject();
            }
            else {
                deferred.resolve(data.result);
            }
        });
        promise.error(function(data, status, headers, config) {
            deferred.reject();
        });
        return deferred.promise;
    }
}]);


})();
