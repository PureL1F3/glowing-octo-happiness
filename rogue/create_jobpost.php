<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

if(!isset($_COOKIE['token']))
{
    return finish(false, "You need to be <a href='#/registration/employer/post'>logged in</a> to post a job.");
}
$token = $_COOKIE['token'];

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

$result = $db->user_bytoken($token);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else if(is_null($result['result']))
{
    finish(false, "You need to be <a href='#/registration/employer/post'>logged in</a> to post a job.");
}
$userid = $result['result']['id'];

$AvailabilityCategories = array('6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM');
$AvailabilityDays = array('M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun');

//form input
$jobpost = json_decode(file_get_contents('php://input'), true);

//form parameters
$job_location_name = '';
$job_location_lat = 0;
$job_location_lon = 0;

$job_employer = '';
$job_title = '';
$job_description = '';
$job_function = 0;
$job_type = 0;
$job_availability = array();

$job_application_type_external = false;
$job_externalurl = '';

$total_hours = 0;


$MAX_NAME_LEN = 100;
$MAX_TITLE_LEN = 100;
$MAX_DESCRIPTION_LEN = 2000;
$MAX_LOCATION_LEN = 10;

//errors
$errors = array();

if(!isset($jobpost['location']))
{
    $errors['location'] = "Location is required.";
}
else
{
    $location = $jobpost['location'];
    if(!isset($location['name']) || !isset($location['lat']) || !isset($location['lon']) )
    {
        $errors['location'] = "Location is required.";
    }
    else
    {
        $job_location_name = trim(strval($location['name']));
        $job_location_name_len = strlen($job_location_name);
        if($job_location_name_len < 1 || $job_location_name_len > $MAX_LOCATION_LEN)
        {
            $errors['location'] = "Location is required and can be max $MAX_LOCATION_LEN characters.";
        }
        else
        {
            $job_location_lat = floatval($location['lat']);
            $job_location_lon = floatval($location['lon']);
            if(abs($job_location_lat) > 90 || abs($job_location_lon) > 180)
            {
                $errors['location'] = "Please enter a valid location.";
            }
        }
    }
}

if(!isset($jobpost['employer']))
{
    $errors['employer'] = "Employer name is required.";
}
else
{
    $job_employer = trim(strval($jobpost['employer']));
    $job_employer_len = strlen($job_employer);
    if($job_employer_len < 1 || $job_employer_len > $MAX_NAME_LEN)
    {
        $errors['employer'] = "Employer name must be 1 to $MAX_NAME_LEN characters.";
    }    
}

if(!isset($jobpost['title']))
{
    $errors['title'] = "Job title is required.";
}
else
{
    $job_title = trim(strval($jobpost['title']));
    $job_title_len = strlen($job_title);
    if($job_title_len < 1 || $job_title_len > $MAX_TITLE_LEN)
    {
        $errors['title'] = "Job title must be 1 to $MAX_TITLE_LEN characters.";
    } 
}

if(!isset($jobpost['description']))
{
    $errors['description'] = "Job description is required.";
}
else
{
    $job_description = trim(strval($jobpost['description']));
    $job_description_len = strlen($job_description);
    if($job_description_len < 1 || $job_description_len > $MAX_DESCRIPTION_LEN)
    {
        $errors['description'] = "Job description must be 1 to $MAX_DESCRIPTION_LEN characters.";
    } 
}

if(!isset($jobpost['jobfunction']))
{
    $errors['jobfunction'] = "Job function is required.";
}
else
{
    $job_function = intval($jobpost['jobfunction']);
    $result = $db->jobfunction_isvalid($job_function);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);
    }
    else if(!$result['result'])
    {
        $errors['jobfunction'] = "Please select a valid job function";        
    }
}

if(!isset($jobpost['jobtype']))
{
    $errors['jobtype'] = "Job type is required.";
}
else
{
    $job_type = intval($jobpost['jobtype']);
    $result = $db->jobtype_isvalid($job_type);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);
    }
    else if(!$result['result'])
    {
        $errors['jobtype'] = "Please select a valid job type";        
    }
}

if(!isset($jobpost['availability']))
{
    $errors['availability'] = "Availability is required.";
}
else
{
    $AvailabilityCategories_count = count($AvailabilityCategories);
    $AvailabilityDays_count = count($AvailabilityDays);

    for($i = 0; $i < $AvailabilityDays_count; $i++)
    {
        if(!isset($jobpost['availability'][$i]))
        {
            break;
        }
        $job_availability[$i] = array();
        for($j = 0; $j < $AvailabilityCategories_count; $j++)
        {
            if(!isset($jobpost['availability'][$i][$j]) || !is_bool($jobpost['availability'][$i][$j]))
            {
                $i = $AvailabilityDays_count;
                break;
            }
            $job_availability[$i][$j] = $jobpost['availability'][$i][$j];

            if($job_availability[$i][$j])
            {
                $total_hours++;
            }
        }
    }

    if($total_hours == 0)
    {
        $errors['availability'] = "Please enter the job availability.";
    }
}

if(!isset($jobpost['applicationtype']))
{
    $errors['applicationtype'] = "Application type is required.";
}
else
{
    if(!is_bool($jobpost['applicationtype']))
    {
        $errors['applicationtype'] = "Application type is required.";
    }
    else
    {
        $job_application_type_external = $jobpost['applicationtype'];
        if($job_application_type_external)
        {
            if(!isset($jobpost['externalurl']))
            {
                $errors['externalurl'] = "For external application type please enter URL or set application type to use StreamHire.";
            }
            else
            {
                $job_externalurl = strval($jobpost['externalurl']);
                if(!filter_var($job_externalurl, FILTER_VALIDATE_URL))
                {
                    $errors['externalurl'] = "That is not a valid URL.";
                }
            }
        }
    }
}

if(count($errors) > 0) 
{
    $result = array('errors' => $errors);
    finish(true, $result);
}

$result = $db->create_jobpost($userid, $job_location_name, $job_location_lat, $job_location_lon, $job_employer, $job_title, $job_description, $job_function, $job_type, $job_externalurl, $total_hours);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else
{
    $jobid = $result['result']['id'];
    $result = $db->create_jobpost_availability($jobid, $job_availability, $AvailabilityDays_count, $AvailabilityCategories_count);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);
    }
    $result = $db->make_jobpost_golive($jobid);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);
    }
}

finish(true, $result);

?>