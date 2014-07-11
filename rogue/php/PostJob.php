<?php

    include_once('config.php');
    include_once('utility.php');
    include_once('streamhiredb.php');

    $country = 1;
      $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);
    $result = $db->connect();

    $jcities = array();
    $jfunctions = array();
    $jtypes = array();
    $joptions = array();

    if($result['ok'])
    {
      $result = $db->cities_forcountry($country);
      if($result['ok'])
      {
        $jcities = $result['result'];
      }
      $result = $db->functions_forcountry($country);
      if($result['ok'])
      {
        $jfunctions = $result['result'];
      }
      $result = $db->types_forcountry($country);
      if($result['ok'])
      {
        $jtypes = $result['result'];
      }
      $result = $db->joboptions_forcountry($country);
      if($result['ok'])
      {
        $joptions = $result['result'];
      }
    }
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Bootstrap 101 Template</title>

    <!-- Bootstrap -->
    <link href="bootstrap-3.2.0-dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="bootstrap-switch-master/css/bootstrap3/bootstrap-switch.min.css" rel="stylesheet">
    <link href="bootstrap-datepicker-master/css/datepicker.css" rel="stylesheet">
    <link href="/streamhire/style.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <div class="container col-lg-6 col-md-6 col-sm-8 col-xs-12 gogo-center">
        <div class="row">
          <p>
            <a href="PostedJobs.html" onClick="history.go(-1);">&larr; Back</a>
          </p>
        </div>

      <div class="row">
        <div class="col-xs-12 text-center"><h1>Job Post</h1><br/></div>
      </div>

     <div class="row">
        <div class="panel panel-warning">
          <div class="panel-heading">
            <h3 class="panel-title">
              <span class="glyphicon glyphicon-briefcase"></span>
              Details
            </h3>
          </div>
          <div class="panel-body">
          <input type="hidden" value="1" id="postcountry" />
          <div class="form-group">
            <span class="glyphicon gogo-icon gogo-icon-map"></span>
            <label for="postaddr">Postal Code</label>
            <input type="text" placeholder="" class="form-control" id="postaddr" />
          </div>
          <div class="form-group">
            <select id="postcity" class="form-control">
              <option value="">City</option>
              <?php 
                foreach($jcities as $key => $val) {
                  echo '<option value="' . $key . '">' . $val . "</option>";
                }
              ?>
            </select>
          </div>
          <div class="form-group">
            <select id="postfunction" class="form-control">
              <option value="">Function</option>
              <?php 
                foreach($jfunctions as $key => $val) {
                  echo '<option value="' . $key . '">' . $val . "</option>";
                }
              ?>
            </select>
          </div>
          <div class="form-group">
            <select id="posttype" class="form-control">
              <option value="">Type</option>
              <?php 
                foreach($jtypes as $key => $val) {
                  echo '<option value="' . $key . '">' . $val . "</option>";
                }
              ?>
            </select>
          </div>
          <div class="form-group">
            <span class="glyphicon glyphicon-pencil"></span>
            <label for="postemployer">Employer</label>
            <input type="text" placeholder="" class="form-control" id="postemployer"/>
          </div>
          <div class="form-group">
            <span class="glyphicon glyphicon-pencil"></span>
            <label for="posttitle">Job Title</label>
            <input type="text" placeholder="" class="form-control" id="posttitle"/>
          </div>
          <div class="form-group">
            <span class="glyphicon glyphicon-pencil"></span>
            <label for="postdescription">Job Description</label>
            <textarea class="form-control gogo-expanding-textarea" id="postdescription"></textarea>
          </div>
            </div>
          </div>
        </div>


      <div class="row">
        <div class="panel panel-warning">
          <div class="panel-heading">
            <h3 class="panel-title">
              <span class="glyphicon glyphicon-briefcase"></span>
              Applicant Requirements
            </h3>
          </div>
          <div class="panel-body">
            <div class="form-group">
              <span class="glyphicon glyphicon-film"></span>
              <input type="checkbox" id="postintrovid" data-size="small" data-on-text="Yes" data-off-text="No" checked>
              <label for="postintrovid">Introduction Video (30s)</label>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-pencil"></span>
              <input type="checkbox" id="postresume" data-size="small" data-on-text="Yes" data-off-text="No" checked>
              <label for="postresume">Resume</label>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-pencil"></span>
              <input type="checkbox" id="postcoverletter" data-size="small" data-on-text="Yes" data-off-text="No" checked>
              <label for="postcoverletter">Cover Letter</label>
            </div>
            <div class="form-group">
              <span class="glyphicon gogo-icon gogo-icon-linkedin"></span>
              <input type="checkbox" id="postlinkedin" data-size="small" data-on-text="Yes" data-off-text="No" checked>
              <label for="postlinkedin">LinkedIn URL</label>
            </div>
            <div class="form-group">
              <span class="glyphicon gogo-icon gogo-icon-web"></span>
                <input type="checkbox" id="postwebsite" data-size="small" data-on-text="Yes" data-off-text="No" checked>
              <label for="postwebsite">Website URL</label>
            </div>

          </div>
        </div>
      </div>
      <div class="row">
        <div class="panel panel-warning">
          <div class="panel-heading">
            <h3 class="panel-title">
              <span class="glyphicon glyphicon-film"></span>
              Prequalifying Video Questions
            </h3>
          </div>
          <div class="panel-body">
            <p>The applicant will be asked to record or upload a max 30 second video answering each of the following questions.</p>
            <div class="form-group">
              <span class="glyphicon glyphicon-film"></span>
              <label for="postvq1">Question 1</label>
              <textarea class="form-control gogo-expanding-textarea" id="postvq1"></textarea>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-film"></span>
              <label for="postvq2">Question 2</label>
              <textarea class="form-control gogo-expanding-textarea" id="postvq2"></textarea>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-film"></span>
              <label for="postvq3">Question 3</label>
              <textarea class="form-control gogo-expanding-textarea" id="postvq3"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="panel panel-warning">
          <div class="panel-heading">
            <h3 class="panel-title">
              <span class="glyphicon glyphicon-calendar"></span>
              Post Duration
            </h3>
          </div>
          <div class="panel-body">
            <div class="form-group">
              <span class="glyphicon glyphicon-calendar"></span>
              <label for="postdate">Post Date</label>
              <div id="sandbox-container">
                <div class="input-group date">
                  <input type="text" class="form-control" id="postdate"><span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-calendar"></span>
              <label for="postoption">Duration</label>
              <select id="postoption" class="form-control">
                <?php 
                  foreach($joptions as $key => $val) {
                    echo '<option value="' . $key . '">' . $val . "</option>";
                  }
                ?>
              </select>
            </div>
            <div class="form-group">
              <p><b>Expiry Date</b><span class="pull-right">Friday, December 25, 2014</span></p>
            </div>
            <div class="form-group">
              <span class="glyphicon glyphicon-lock"></span>
              <label for="postpromo">Promo Code</label>
              <input type="text" placeholder="" class="form-control" id="postpromo"/>
            </div>
            <div class="gogo-side-padding"> 
              <button type="button" id="previewBtn" name="preview" class="btn btn-default col-xs-4 col-xs-offset-1 text-center">Preview</button>
              <span class="col-xs-2"></span>
              <button type="button" class="btn btn-default col-xs-4 text-center">Submit</button><br /><br />
            </div>
          </div>
        </div>
      </div>

    </div>
<br />

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="jquery-1.11.1/jquery-1.11.1.min.js"></script>
    <script src="jquery-ui-1.11.0/jquery-ui.min.js"></script>
    <script src="bootstrap-3.2.0-dist/js/bootstrap.min.js"></script>
    <script src="bootstrap-switch-master/js/bootstrap-switch.min.js"></script>
    <script src="bootstrap-datepicker-master/js/bootstrap-datepicker.js"></script>
<script>

$(function() {
  $('.gogo-expanding-textarea').each(function(){
   this.addEventListener('keyup', function() {
      this.style.overflow = 'hidden';
      this.style.height = 0;
      this.style.height = this.scrollHeight + 'px';
  }, false);});

  $("#postintrovid").bootstrapSwitch();
  $("#postcoverletter").bootstrapSwitch();
  $("#postresume").bootstrapSwitch();
  $("#postlinkedin").bootstrapSwitch();
  $("#postwebsite").bootstrapSwitch();



  $('#sandbox-container .date').datepicker({
      startDate: "06/27/2014",
      todayBtn: "linked",
      todayHighlight: true
  });


$("#previewBtn").click(function(){
    console.log("ok");
    var params = {'postaddr' : $('#postaddr').val().trim(),
                  'postcountry' : $('#postcountry').val(),
                  'postcity' : $('#postcity').val() ,
                  'postfunction' : $('#postfunction').val(),
                  'posttype' : $('#posttype').val(),
                  'postemployer' : $('#postemployer').val().trim(),
                  'posttitle' : $('#posttitle').val().trim(),
                  'postdescription' : $('#postdescription').val().trim(),
                  'postintrovid' : $('#postintrovid').val() == 'on' ? 1 : 0,
                  'postresume' : $('#postresume').val() == 'on' ? 1 : 0,
                  'postcoverletter' : $('#postcoverletter').val() == 'on' ? 1 : 0,
                  'postlinkedin' : $('#postlinkedin').val() == 'on' ? 1 : 0,
                  'postwebsite' : $('#postwebsite').val() == 'on' ? 1 : 0,
                  'postvq1' : $('#postvq1').val(),
                  'postvq2' : $('#postvq2').val(),
                  'postvq3' : $('#postvq3').val(),
                  'postdate' : $('#postdate').val(),
                  'postoption' : $('#postoption').val(),
                  'postpromo' : $('#postpromo').val()
                  };


  var JOBPOST_ADDR_MAXCHAR = 100;

  var JOBPOST_EMPLOYER_MINCHAR = 1;
  var JOBPOST_EMPLOYER_MAXCHAR = 200;

  var JOBPOST_TITLE_MINCHAR = 1;
  var JOBPOST_TITLE_MAXCHAR = 200;

  var JOBPOST_DESCRIPTION_MINCHAR = 1;
  var JOBPOST_DESCRIPTION_MAXCHAR = 5000;

  var JOBPOST_VQ_MAXCHAR = 500;

  var JOBPOST_PROMO_MAXCHAR = 45;

  var errors = [];

  if(params['postaddr'].length > JOBPOST_ADDR_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Address must be max ', JOBPOST_ADDR_MAXCHAR, ' characters');
  }
  if(params['postemployer'].length < JOBPOST_EMPLOYER_MINCHAR || params['postemployer'].length > JOBPOST_EMPLOYER_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Employer name must be ', JOBPOST_EMPLOYER_MINCHAR, ' to ', JOBPOST_EMPLOYER_MAXCHAR, ' characters');
  }
  if(params['posttitle'].length < JOBPOST_TITLE_MINCHAR || params['posttitle'].length > JOBPOST_TITLE_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Job title must be ', JOBPOST_TITLE_MINCHAR, ' to ', JOBPOST_TITLE_MAXCHAR, ' characters');
  }
  if(params['postdescription'].length < JOBPOST_DESCRIPTION_MINCHAR || params['postdescription'].length > JOBPOST_DESCRIPTION_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Job description must be ', JOBPOST_DESCRIPTION_MINCHAR, ' to ', JOBPOST_DESCRIPTION_MAXCHAR, ' characters');
  }
  if(params['postvq1'].length > JOBPOST_VQ_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Video Question #1 must be max ', JOBPOST_VQ_MAXCHAR, ' characters');
  }
  if(params['postvq2'].length > JOBPOST_VQ_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Video Question #2 must be max ', JOBPOST_VQ_MAXCHAR, ' characters');
  }
  if(params['postvq3'].length > JOBPOST_VQ_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Video Question #3 must be max ', JOBPOST_VQ_MAXCHAR, ' characters');
  }
  if(params['postpromo'].length > JOBPOST_PROMO_MAXCHAR)
  {
    errors[errors.length] = ''.concat('Promo code must be max ', JOBPOST_PROMO_MAXCHAR, ' characters');
  }

  console.log(params);
  console.log(errors);
});

});


</script>
  </body>
</html>