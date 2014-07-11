(function() {
    function addDays(date,addDays) {
    return new Date(date.getTime() + (addDays*24*60*60*1000));
    }

    var app = angular.module("streamhire", ['ngSanitize', 'ui.bootstrap']);

    app.service('AccountAPI', ['$http', function($http) {
        var that = this;
        this.Account = {
            name: '',
            email: '',
            type: 0
        };
        this.IsLoggedIn = false;

        this.AccountOptions = [];

        this.Logout = function() {
            var config = {
                method: 'POST',
                url: '/secondcrack/php/logout.php',
            };

            $http(config);
        };

        this.Login = function(email, password) {
            var config = {
                method: 'POST',
                url: '/secondcrack/php/login.php',
                params: { email : email, pwd : password }
            };

            $http(config);
        };

        this.SetAccount = function(name, email) {
            this.Account.name = name;
            this.Account.email = email;
            //this.Account.type = (this.AccountOptions | { name : type }).id;
            this.IsLoggedIn = true;
        };

        this.ClearAccount = function() 
        {
            this.Account.name = null;
            this.Account.email = null;
            this.IsLoggedIn = false;

        }

        this.LoadAccountOptions = function() {
            var config = {
                method: 'GET',
                url: '/secondcrack/php/account/account_options.php'
            };

            $promise = $http(config);
            $promise.success(function(data, status, headers, config){
                if(data.ok)
                {
                    that.AccountOptions = data.result;
                }
            });
        };

        this.LoadAccountOptions();
    }]);
    
    app.service('JobAPI', ['$http', function($http){
        var that = this;
        this.JobTypes = [];
        this.JobFunctions = [];
        this.JobCities = [];
        this.JobPostOptions = [];

        this.PostJob = function(jobpost){

        };

        this.LoadJob = function() {

        };

        this.LoadStatic = function() {
            var config = {
                method: 'GET',
                url: '/secondcrack/php/job/job_static.php'
            };

            $promise = $http(config);
            $promise.success(function(data, status, headers, config){
                if(data.ok)
                {
                    that.JobTypes = data.result.types;
                    that.JobFunctions = data.result.functions;
                    that.JobCities = data.result.cities;
                    that.JobPostOptions = data.result.postoptions;
                }
            });
            $promise.error(function(data, status, headers, config){
                console.log('error');
            });
        };
        this.LoadStatic();
    }]);


    app.controller('StreamHireRegistrationController', ['$scope', 'JobAPI', function($scope, JobAPI){
        $scope.JobAPI = JobAPI;
        $scope.AvailabilityDays = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];
        $scope.AvailabilityHours = ['12AM', ' 1AM', ' 2AM', ' 3AM', ' 4AM', ' 5AM', ' 6AM', ' 7AM', ' 8AM', ' 9AM', '10AM', '11AM',
                                    '12PM', ' 1PM', ' 2PM', ' 3PM', ' 4PM', ' 5PM', ' 6PM', ' 7PM', ' 8PM', ' 9PM', '10PM', '11PM'];
        $scope.AvailabilityDistance = ['2', '5', '10', '25', '50', '100'];

        $scope.JobResume = "";

        $scope.Availability = {};
        $scope.JobFunction = null;
        $scope.JobDistance = null;

        $scope.ToggleAvailability = function(day, hour_text)
        {
            day_text = $scope.AvailabilityDays[day];
            key = day_text + hour_text;
            if(key in $scope.Availability)
            {
                $scope.Availability[key] = !$scope.Availability[key];   
            }
            else
            {
                $scope.Availability[key] = true;
            }

        };

        $scope.IsAvailable = function(day, hour_text)
        {
            day_text = $scope.AvailabilityDays[day];
            key = day_text + hour_text;

            return key in $scope.Availability ? $scope.Availability[key] : false;
        };

    }]);

    app.controller('MyJobPostsCtrl', ['$scope', 'JobAPI', 'AccountAPI', function($scopeJobAPI, AccountAPI){

    }]);

    app.controller('JobPostCtrl', ['$scope', '$sce', '$anchorScroll', '$http', '$location', 'JobAPI', 'AccountAPI', function($scope, $sce, $anchorScroll, $http, $location, JobAPI, AccountAPI){


        $scope.$watch('JobPost.city', function(newval, oldval){
            var v = _.findWhere( JobAPI.JobCities, { id : newval } );
            if(!(v === undefined || v === null))
            {
                $scope.JobCity = v.name;
            }
        });
        $scope.$watch('JobPost.jobfunction', function(newval, oldval){
            var v = _.findWhere( JobAPI.JobFunctions, { id : newval } );
            if(!(v === undefined || v === null))
            {
                $scope.JobFunction = v.name;
            }
        });
        $scope.$watch('JobPost.jobtype', function(newval, oldval){
            var v = _.findWhere( JobAPI.JobTypes, { id : newval } );
            if(!(v === undefined || v === null))
            {
                $scope.JobType = v.name;
            }
        });

        $scope.$watch('JobPost.description', function(newval, oldval){
            $scope.JobPostDescription = S(newval).escapeHTML().s;
        });

        $scope.$watch('JobPost.postdate', function(newval, oldval){
            var v = _.findWhere( JobAPI.JobPostOptions, { id : $scope.JobPost.postoption } );
            if(!(v === undefined || v === null))
            {
                var d = addDays(newval, v.days);
                $scope.JobPostExpiryDate = new Date(d);
            }
        });

        $scope.$watch('JobPost.postoption', function(newval, oldval){
            var v = _.findWhere( JobAPI.JobPostOptions, { id : newval } );
            if(!(v === undefined || v === null))
            {
                var d = addDays($scope.JobPost.postdate, v.days);
                $scope.JobPostExpiryDate = d;
            }
        });

        $scope.ShowingVideo = function(videon){
            var vq = '';
            switch(videon)
            {
                case 1:
                    vq = $scope.JobPost.vq1;
                    break;
                case 2:
                    vq = $scope.JobPost.vq2;
                    break;
                case 3:
                    vq = $scope.JobPost.vq3;
                    break;
            }

            return vq.trim().length > 0;
        }
        $scope.ShowingAnyVideos = function(){
            return $scope.JobPost.introvid || $scope.ShowingVideo(1) || $scope.ShowingVideo(2) || $scope.ShowingVideo(3);
        }

        $scope.TogglePreview = function() {
            $scope.PreviewTab = !$scope.PreviewTab;
            if($scope.PreviewTab)
            {
                $scope.PreviewToggleButtonText = 'Edit';
            }
            else
            {
                $scope.PreviewToggleButtonText = 'Preview';
            }   
            
            $location.hash('jobpost-top');
            $anchorScroll();
        }

        $scope.SubmitJobPost = function() {
            var request = $http({
                    method: "post",
                    url: "/secondcrack/php/job/post_job.php",
                    data: $scope.JobPost
                });
            request.success(function(data, status, headers, config)
            {
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);

                $scope.ResetFormErrors();

                if(data.ok)
                {
                    if(data.result.ErrorMessage)
                    {
                        $scope.FormErrorMessage = data.result.ErrorMessage;
                        $scope.FormErrors = data.result.Errors;
                    }
                    if(data.result.ExpireAccount && !data.result.Account)
                    {
                        AccountAPI.ClearAccount();
                    }
                    else if(data.result.Account)
                    {
                        AccountAPI.SetAccount(data.Account.email, data.Account.name);
                    }

                    if(data.result.JobPostID)
                    {
                        console.log('Fucking win:' + data.result.JobPostID);
                    }
                }
                else
                {   
                    $scope.FormErrorMessage = data.result;
                }
            });
        }

        $scope.ShowJobPostExpiry = function() {
            return true;                //todo - revert
            //return $scope.JobPostExpiry.length > 0;
        };

        $scope.ResetFormErrors = function() 
        {
            $scope.FormErrorMessage = '';
            $scope.FormErrors = {
                address: '',
                city: '',
                jobfunction: '',
                jobtype: '',
                employer: '',
                title: '',
                description: '',
                introvid: '',
                resume: '',
                coverletter: '',
                linkedin: '',
                website: '',
                vq1: '',
                vq2: '',
                vq3: '',
                postoption: '',
                postdate: '',
                promo: '',
                email: '',
                password: ''
            };
        }

        $scope.JobAPI = JobAPI;
        $scope.AccountAPI = AccountAPI;
        $scope.FormErrorMessage = null;
        $scope.FormErrors = {};
        $scope.ResetFormErrors();
        $scope.FormLoading = false;

        $scope.JobPost = {
            address: '',
            city: 0,
            jobfunction: 0,
            jobtype: 0,
            employer: '',
            title: '',
            description: '',
            introvid: true,
            resume: true,
            coverletter: true,
            linkedin: true,
            website: true,
            vq1: '',
            vq2: '',
            vq3: '',
            postoption: 0,
            postdate: null,
            promo: '',
            email: '',
            password: ''
        };
        $scope.JobCity = '';
        $scope.JobFunction = '';
        $scope.JobType = '';
        $scope.JobPostDescription = '';
        $scope.PreviewTab = true;
        $scope.PreviewToggleButtonText = '';
        $scope.JobPostExpiryDate = '...';
        $scope.TogglePreview();
        //date picker functionality for post date
        $scope.today = function() {
            var d = new Date();
            d.setSeconds(0);
            d.setMinutes(0);
            d.setHours(0);
            $scope.JobPost.postdate = d;
        };
        $scope.today();
        $scope.clear = function () {
            $scope.JobPost.postdate = null;
        };
        $scope.dp_toggleMin = function() {
            var d = new Date();
            d.setSeconds(0);
            d.setMinutes(0);
            d.setHours(0);
            $scope.dp_minDate = $scope.dp_minDate ? null : d;
        };
        $scope.dp_toggleMin();
        $scope.dp_open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.dp_opened = true;
        };
        $scope.dp_dateOptions = {
        };
        $scope.dp_format = 'mediumDate';

        // $scope.Test = function()
        // {
        //     $scope.JobPost = {
        //         address: 'addy',
        //         city: 1,
        //         jobfunction: 1,
        //         jobtype: 1,
        //         employer: 'Employer Ba',
        //         title: 'Title Ta',
        //         description: 'Descript D',
        //         introvid: true,
        //         resume: true,
        //         coverletter: true,
        //         linkedin: true,
        //         website: true,
        //         vq1: 'Q1 kool',
        //         vq2: 'Q2 flik',
        //         vq3: 'Q3 blaaa',
        //         postoption: 1,
        //         postdate: null,
        //         promo: '',
        //         email: 'go@daddy.com',
        //         password: 'password'
        //     };
        // };
        // $scope.Test();

    }]);

})();