<?php

$availability = array(0 => array(0, 1, 2), 2 => array(1, 2, 3));


//get total hours for job
$sum_hours = 0;
foreach($availability as $day => $hours) {
    foreach($hours as $hour) {
        $sum_hours += 1;
    }
}
echo "Total hours: $sum_hours\n<br><br><br>";

$title = 'Title';
$description = 'Description';
//create job post
$sql = "insert into job(userid, title, description, total_hours) value (0, '$title', '$description', $sum_hours)";
echo "Insert job query: $sql\n<br><br><br>";

$jobid = 1;

//insert job post availability
$sql = "insert into job_availability(jobid, day, hour) values ";
foreach($availability as $day => $hours) {
    foreach($hours as $hour) {
        $sql .= "($jobid, $day, $hour),";
    }
}
$sql = rtrim($sql, ",");
echo "Insert job availability query: $sql\n<br><br><br>";

$coverage_hours = 10;
//find job posts relevant to search
$sql =  "select j.id, j.title, j.description, a.hours as match_hours, " .
        "j.total_hours, a.hours/j.total_hours as matchpct, a.hours/$coverage_hours as coveragepct " .
        "from job as j " .
        "right join ( " .
            "select jobid, count(hour) as hours " .
            "from job_availability " .
            "where ";

$print_or = false;
foreach($availability as $day => $hours) {
    if($print_or)
    {
        $sql .= "or ";
    }
    $sql .= "(day=$day and hour in (";
    foreach($hours as $hour) {
        $sql .= "$hour,";
    }
    $sql = rtrim($sql, ",");
    $sql .= ")) ";
    $print_or = true;
}

$sql .= "group by jobid ";
$sql .= ") as a on j.id=a.jobid ";
$sql .= "order by matchpct desc, coveragepct desc";

echo "Search with job availability query: $sql\n<br><br><br>";

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Job Post</title>
    <link href="/rogue/js/libs/jquery-ui-1.11.0/jquery-ui.css" rel="stylesheet" />
    <link href="/rogue/js/libs/bootstrap-3.2.0-dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="/rogue/css/style.css" rel="stylesheet" />
    <link href="/rogue/pink.flag/jplayer.pink.flag.css" rel="stylesheet" type="text/css" />
    <link href="/rogue/style.css" rel="stylesheet" type="text/css" />
    <style>
    </style>
  </title>
<body ng-app>
<div>


<div class="panel panel-warning">
    <div class="panel-heading text-center">
        <h4 class="panel-title">Job Search</h4>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <label>Your postal code</label><button type="button" class="btn btn-info pull-right">Use My Location</button> 
            <input class="form-control" type="text" placeholder="Postal Code" />
        </div>
        <div class="ng-scope">
            <label>How far (in km) would you travel to work?</label>
            <select class="form-control" ng-model="JobDistance" ng-options="v as v for v in AvailabilityDistance">
            </select>
        </div>
        <br>
        <label>Availability</label>
        <table class="table table-bordered table-condensed table-striped text-center">
        <thead>
            <tr>
                <th></th>
                <th class="text-center"><small>Any</small></th>
                <th class="text-center"><small>Morning<br><br>(6am - 12pm)</small></th>
                <th class="text-center"><small>Afternoon<br><br>(12pm - 6pm)</small></th>
                <th class="text-center"><small>Evening<br><br>(6pm - 12am)</small></th>
                <th class="text-center"><small>Night<br><br>(12am - 6am)</small></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Mon</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Tue</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Wed</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Thr</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Fri</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Sat</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
            <tr>
                <td>Sun</td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
                <td><input type="checkbox" name="" value=""></td>
            </tr>
        </tbody>
    </table>
    <div class="text-center">
        <button type="button" class="btn btn-success">Search</button>
    </div>
</div>
</div>

<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Available Jobs
</h3>
</div>
<div class="list-group">
<a href="#" class="list-group-item">
<h4 style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><u>Beverage Manager</u></h4>
<h5 style="margin-top: 5px; margin-bottom: 1px;">Reds Wine Tavern</h5>
<p>Toronto, ON | Posted 5 days ago
<br>
<img src="icons/rogue_star.png" style="width: 16px; height: 16px;"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"> Job Hours Match (6 / 8)
<br>
<img src="icons/rogue_star.png" style="width: 16px; height: 16px;"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"> Availability Coverage (6 / 15)
</p>
  </a>
<a href="#" class="list-group-item">
<h4 style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><u>Beverage Manager</u></h4>
<h5 style="margin-top: 5px; margin-bottom: 1px;">Reds Wine Tavern</h5>
<p>Toronto, ON | Posted 5 days ago
<br>
<img src="icons/rogue_star.png" style="width: 16px; height: 16px;"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"> Job Hours Match (6 / 8)
<br>
<img src="icons/rogue_star.png" style="width: 16px; height: 16px;"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"> Availability Coverage (6 / 15)
</p>
  </a>
</div>


<ul class="pager">
  <li class="previous"><a href="#">&larr; Previous</a></li>
  <li class="next"><a href="#">Next &rarr;</a></li>
</ul>
</div>

<div class="panel panel-warning">
    <div class="panel-heading text-center">
        <h4 class="panel-title">Candidate Search</h4>
        <p>
            <br>Find resume's of job seekers by keyword who match your job availability, job type, and are looking in area.
        </p>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <label>Keywords</label>
            <input class="form-control" type="text" placeholder="Keywords" />
        </div>
        <div class="text-center">
            <button type="button" class="btn btn-success">Search</button>
        </div>
    </div>
</div>
<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Available Candidates
</h3>
</div>
<ul class="list-group"> 
<li class="list-group-item">
<h4>Candidate #123</h4>
<p>Toronto, ON | Updated 5 days ago
<br>
<img src="icons/rogue_star.png" style="width: 16px; height: 16px;"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star.png" style="width: 16px; height: 16px"><img src="icons/rogue_star_empty.png" style="width: 16px; height: 16px"> Job Hours Match (6 / 8)
<h5 data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><span class="glyphicon glyphicon-collapse-down"></span> <u>Resume</u></h5>
<div class="collapse" id="bs-example-navbar-collapse-1">
This is my resume
</div>
<h5 data-toggle="collapse" data-target="#bs-example-navbar-collapse-2" style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><span class="glyphicon glyphicon-collapse-down"></span> <u>Availability</u></h5>
<div class="collapse" id="bs-example-navbar-collapse-2">
This is my resume
</div>
<br>
<button type="button" class="btn btn-success btn-sm">Invite To Apply</button>
</p>
  </li>
</ul>
</div>

<ul class="pager">
  <li class="previous"><a href="#">&larr; Previous</a></li>
  <li class="next"><a href="#">Next &rarr;</a></li>
</ul>


<div class="panel panel-warning">
    <div class="panel-heading text-center">
        <h4 class="panel-title">Job Application</h4>
        <p>
            <br>Find resume's of job seekers by keyword who match your job availability, job type, and are looking in area.
        </p>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <label>Name</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>E-Mail</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>Phone #</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>Resume</label>
            <textarea class="form-control"></textarea>
        </div>
        <div class="form-group">
            <label>Hours of Availability</label>
            <table class="form-control table table-bordered table-condensed table-striped text-center">
                <tr>
                    <th></th>
                    <th>M</th>
                    <th>T</th>
                    <th>W</th>
                    <th>Th</th>
                    <th>F</th>
                    <th>Sat</th>
                    <th>Sun</th>
                </tr>
                <tr>
                    <td>Any</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>6AM - 10AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>10AM - 2PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>2PM - 6PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>6PM - 10PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>10PM - 2AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>2AM - 6AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
            </table>
        </div>
        <div class="text-center">
            <button type="button" class="btn btn-success">Apply</button>
        </div>
    </div>
</div>

<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Profile
</h3>
</div>
    <div class="panel-body">
        <div class="form-group">
            <label>Name</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>E-Mail</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>Phone #</label>
            <input class="form-control" type="text" placeholder="" />
        </div>
        <div class="form-group">
            <label>Resume</label>
            <textarea class="form-control"></textarea>
        </div>
        <div class="form-group">
            <label>Hours of Availability</label>
            <table class="form-control table table-bordered table-condensed table-striped text-center">
                <tr>
                    <th></th>
                    <th>M</th>
                    <th>T</th>
                    <th>W</th>
                    <th>Th</th>
                    <th>F</th>
                    <th>Sat</th>
                    <th>Sun</th>
                </tr>
                <tr>
                    <td>Any</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>6AM - 10AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>10AM - 2PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>2PM - 6PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>6PM - 10PM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>10PM - 2AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>2AM - 6AM</td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                </tr>
            </table>
        </div>
        <div class="text-center">
            <button type="button" class="btn btn-danger">Update</button>
        </div>
    </div>
</div>


<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Applied Jobs
</h3>
</div>
<ul class="list-group"> 
<li class="list-group-item">

<h4 style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><u>Beverage Manager</u><span class="pull-right label label-danger">Expired</span></h4>
<h5 style="margin-top: 5px; margin-bottom: 1px;">Reds Wine Tavern</h5>
<p>Toronto, ON | Applied 5 days ago</p>
  </li>
</ul>
<div class="text-center">
<ul class="pagination pagination-lg">
  <li><a href="#">&laquo;</a></li>
  <li><a href="#">1</a></li>
  <li><a href="#">2</a></li>
  <li><a href="#">3</a></li>
  <li><a href="#">4</a></li>
  <li><a href="#">5</a></li>
  <li><a href="#">&raquo;</a></li>
</ul>
</div>
</div>

<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Saved Jobs
</h3>
</div>
<ul class="list-group"> 
<li class="list-group-item">
<h4 style="margin-top: 5px; margin-bottom: 1px; color: #03AB52; font-weight: normal;"><u>Beverage Manager</u><span class="pull-right label label-danger">Expired</span></h4>
<h5 style="margin-top: 5px; margin-bottom: 1px;">Reds Wine Tavern</h5>
<p>Toronto, ON | Saved 5 days ago</p>
  </li>
</ul>
<div class="text-center">
<ul class="pagination">
  <li><a href="#">&laquo;</a></li>
  <li><a href="#">1</a></li>
  <li><a href="#">2</a></li>
  <li><a href="#">3</a></li>
  <li><a href="#">4</a></li>
  <li><a href="#">5</a></li>
  <li><a href="#">&raquo;</a></li>
</ul>
</div>
</div>


<div class="panel panel-success">
<div class="panel-heading">
<h3 class="panel-title">
    Employer Profile
</h3>
</div>
 <div class="panel-body">
<div class="form-group">
    <label>Employer Name</label>
    <input class="form-control" type="text" placeholder="" />
</div>
<div class="form-group">
    <label>Employer Description</label>
    <textarea class="form-control"></textarea>
</div>
<div class="form-group">
    <label>Employer Website</label>
    <input class="form-control" type="text" placeholder="" />
</div>
<div class="form-group">
    <label>Accountholder Name</label>
    <input class="form-control" type="text" placeholder="" />
</div>
<div class="form-group">
    <label>E-Mail</label>
    <input class="form-control" type="text" placeholder="" />
</div>
<div class="form-group">
    <label>Phone #</label>
    <input class="form-control" type="text" placeholder="" />
</div>
<p>
    <label>Account Verification</label><a href="#" class="pull-right">&nbsp;<u>Verify</u></a><br>
    <span class="label label-danger">Not Verified</span> Verify your accoung to establish yourself as trusted employer for job seekers on StreamHire to improve your chance of getting a great hire.
    <br>
</p>
<div class="text-center">
    <button type="button" class="btn btn-danger">Update</button>
</div>
</div>
</div>
</div>
<div class="panel panel-success">

<h4></h4>


</div>
</div>

        <script src="js/libs/jquery-1.11.1.min.js"></script>
        <script src="js/libs/jquery-ui-1.11.0/jquery-ui.min.js"></script>
        <script src="js/libs/bootstrap-3.2.0-dist/js/bootstrap.min.js"></script>
        <script src="js/libs/angular.min.js"></script>
        <script src="js/libs/angular-sanitize.min.js"></script>
        <script src="js/libs/ui-bootstrap-tpls-0.11.0.min.js"></script>
        <script src="js/libs/underscore.min.js"></script>
        <script src="js/libs/string.js"></script>
        <script src="js/libs/date.js"></script>
        <script src="js/app.js"></script>
        <script type="text/javascript" src="jQuery.jPlayer.2.6.0/jquery.jplayer.min.js"></script>
        <script type="text/javascript" src="jQuery.jPlayer.2.6.0/add-on/jplayer.playlist.min.js"></script>
    </body>
</html>