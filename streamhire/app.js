(function() {
    var app = angular.module("streamhire", ['ui.bootstrap', 'ngSanitize']);

    app.service('streamhireAPI', ['$http', function($http, $anchorScroll) {
    
    this.cities = [];
    this.loadStatic = function(cid, f)
    {
        var config = {
            method : 'GET',
            url : '/streamhire/quack.php',
            params : { cid : cid, f : f }
        };

        return $http(config);
    };
    }]);

    app.controller("JobHighlevelController",['streamhireAPI', '$scope', function(streamhireAPI, $scope) {

        $scope.updateExpiryDate = function(newdate)
        {
            $scope.expiredate = newdate;
        };

        $scope.expirePost = function() {

        };

        $scope.extendPost = function() {

        };

        $scope.extendpost = {
            optionid : null,
            promo : null
        };

        $scope.job = {
            title : 'Bar Server',
            employer : 'Jack Astors Bar & Grill',
            type : 'Part Time',
            func : 'Hspitality',
            city : 'ON - Toronto',
            status : 'Active',
            submitted : '20140523T123123Z',
            postdate : '20140523T123123Z',
            expiredate  : '20140523T123123Z',
            candidates : {
                newones : [],
                yesones : [
                    {
                        id : 1,
                        name : 'Anna Vassilovski',
                        submitted : '20140523T123123Z'
                    }
                ],
                noones : [
                    {
                        id : 1,
                        name : 'Anna Vassilovski',
                        submitted : '20140523T123123Z'
                    }
                ]
            }
        };

        $scope.openSection = '';
        $scope.showOpen = function(section) {
            return section === $scope.openSection;
        };
        $scope.hitSection = function(section) {
            $scope.openSection = ($scope.showOpen(section) ? '' : section);
        }
        $scope.candidatesNewExpanderShow = function() {
            return $scope.job.candidates.newones.length > 0;
        }
        $scope.candidatesYesExpanderShow = function() {
            return $scope.job.candidates.yesones.length > 0;
        }
        $scope.candidatesNoExpanderShow = function() {
            return $scope.job.candidates.noones.length > 0;
        }
    }]);

    app.controller("JobPostController", ['streamhireAPI', '$scope', '$location', '$anchorScroll', function(streamhireAPI, $scope, $location, $anchorScroll) {

        $scope.nextMode = 'Preview';
        $scope.isEditMode = function() {
            return $scope.nextMode === 'Preview';
        };
        $scope.setNextMode = function() {
            if($scope.nextMode === 'Preview')
            {
                $scope.nextMode = 'Edit';
            }
            else
            {
                $scope.nextMode = 'Preview';
            }
            $location.hash('jobposttop');
            $anchorScroll();

    // call $anchorScroll()
    $anchorScroll();
        }

        $scope.country = 1;

        $scope.cities = [
            { id : 1, name : "ON - Toronto" },
            { id : 2, name : "ON - Ottawa" }
        ];

        $scope.funcs = [
            { id : 1, name : "Bakeware" },
            { id : 2, name : "Swag" }
        ];

        $scope.types = [
            { id : 1, name : "Part Time" },
            { id : 2, name : "Full Time" }
        ];

        $scope.postoptions = [
            { id : 1, name : "5 days for $25", days : 5 },
            { id : 2, name : "14 days for $40", days : 14 },
            { id : 3, name : "30 days for $50", days : 30 },
        ];

        $scope.job = {
            address : 'a',
            city : 45,
            func : 1,
            type : 1,
            employer : 'Keg Steakhouse & Bar',
            title : 'Bar Servers',
            description : 'Monardo\'s Services is looking for people just like you! We are a company that employs hospitality staff and sends them out to different venues. We are very proud to say that we treat our people the best in the business. Our entire mission is for our team to be happy, and enjoy what they are doing, and to pass that attitude onto our guests!\n\n\nWeekly we ask you your availability, and based on when you\'d like to work we build shifts around you. We treat our people with dignity and respect. Our team only work when they WANT to.\n\n\nWe take pride in hands on training. This ensures top notch service and gives people with a good attitude a chance to get experience. The only real requirement is an amazing attitude, and an outgoing friendly personality.\n\n\nWe ask that you be available at least 2 weekends a month, and in exchange we let you choose what days you work!.\n\n\nIf this sounds like something you\'d be interested in contact us and we will discuss setting up an interview.',
            introvid : true,
            resume : true,
            coverletter : true,
            linkedin : true,
            website : true,
            vq1 : '',
            vq2 : '',
            vq3 : '',
            postdate : null,
            postoption : 1,
            promo : ''
        };

        $scope.account = {
            id : null,
            email : '',
            pwd : ''
        };

        $scope.jobpreview = {
            city : 'ON - Toronto',
            description : '',
            func : 'Food / Beverage / Hospitality',
            type: 'Internship'
        }

        $scope.submitJobPost = function() {

        };

        //calendar functions
        $scope.setDateToday = function() {
            $scope.job.postdate = $scope.minPostDate;
        };
        $scope.setDateClear = function() {
            $scope.job.postdate = null;
        };        
        $scope.datepickerOpen = false;
        $scope.openDatePicker = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datepickerOpen = true;
        };
        $scope.datepickerFormat = ['fullDate'];

        //initialization
        $scope.minPostDate = new Date();
        $scope.setDateToday();

        streamhireAPI.loadStatic($scope.country, 'jcity').success(function(data) {
            if(data.ok)
            {
                $scope.cities = data.result;
            }
        });
        streamhireAPI.loadStatic($scope.country, 'jfunc').success(function(data) {
            if(data.ok)
            {
                $scope.funcs = data.result;
            }
        });
        streamhireAPI.loadStatic($scope.country, 'jtype').success(function(data) {
            if(data.ok)
            {
                $scope.types = data.result;
            }
        });
        streamhireAPI.loadStatic($scope.country, 'jopt').success(function(data) {
            if(data.ok)
            {
                $scope.postoptions = data.result;
            }
        });

        $scope.$watch('job.description', function(newValue, oldValue) {
            console.log(newValue);

            var d = newValue.trim().replace(/\n/g, '<br />');



            $scope.jobpreview.description = d;
        });

        $scope.showVideo = function(vidn) {
            var q = '';
            switch(vidn)
            {
                case 1:
                    q = $scope.job.vq1;
                    break;
                case 2:
                    q = $scope.job.vq2;
                    break;
                case 3:
                    q = $scope.job.vq3
                    break;
            }

            return q.trim().length > 0;
        }

        $scope.showAnyVideos = function() {
            return $scope.job.introvid || $scope.showVideo(1) || $scope.showVideo(2) || $scope.showVideo(3);
        }
    }]);
})();