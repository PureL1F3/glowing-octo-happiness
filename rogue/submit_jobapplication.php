<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

//registration input
$application = json_decode(file_get_contents('php://input'), true);

$AvailabilityCategories = array('6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM');
$AvailabilityDays = array('M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun');

$jobid = 0;
$userid = 0;
$application_name = '';
$application_email = '';
$application_phone = '';
$application_resume = '';
$application_availability = array();

$errors = array();

//requirements for registration parameters
$MAX_NAME_LEN = 100;
$MAX_RESUME_LEN = 5000;
$MAX_PHONE_LEN = 15;

if(!isset($application['jobid']))
{
    finish(false, 'Bad request.');
}
else
{
    $jobid = intval($application['jobid']);
    if($jobid <= 0)
    {
        finish(false, 'Bad request.');  
    }   
}

if(!isset($application['name']))
{
    $errors['name'] = 'Your  name is required.';
}
else
{    
    $application_name = trim(strval($application['name']));
    $application_name_len = strlen($application_name);
    if($application_name_len < 1 || $application_name_len > $MAX_NAME_LEN)
    {
        $errors['name'] = "Please enter your name up to a max $MAX_NAME_LEN characters.";
    }
}

if(!isset($application['email']))
{
    $errors['email'] = 'Please enter your e-mail.';
}
else
{    
    $application_email = trim(strval($application['email']));
    if(!filter_var($application_email, FILTER_VALIDATE_EMAIL))
    {
        $errors['email'] = 'That is not a valid e-mail.';
    }
}

if(isset($application['phone']))
{
    $application_phone = trim(strval($application['phone']));
    $application_phone_len = strlen($application_phone);
    if($application_phone_len > $MAX_PHONE_LEN)
    {
        $errors['phone'] = "Phone number must be max $MAX_PHONE_LEN characters.";
    }
}

if(!isset($application['resume']))
{
    $errors['resume'] = 'Your  resume is required.';
}
else
{    
    $application_resume = trim(strval($application['resume']));
    $application_resume_len = strlen($application_resume);
    if($application_resume_len < 1 || $application_resume_len > $MAX_RESUME_LEN)
    {
        $errors['resume'] = "Please enter your resume up to a max $MAX_RESUME_LEN characters.";
    }
}

if(!isset($application['availability']))
{
    $errors['availability'] = "Availability is required.";
}
else
{
    $AvailabilityCategories_count = count($AvailabilityCategories);
    $AvailabilityDays_count = count($AvailabilityDays);
    $total_hours = 0;

    for($i = 0; $i < $AvailabilityDays_count; $i++)
    {
        if(!isset($application['availability'][$i]))
        {
            break;
        }
        $application_availability[$i] = array();
        for($j = 0; $j < $AvailabilityCategories_count; $j++)
        {
            if(!isset($application['availability'][$i][$j]) || !is_bool($application['availability'][$i][$j]))
            {
                $i = $AvailabilityDays_count;
                break;
            }
            $application_availability[$i][$j] = $application['availability'][$i][$j];

            if($application_availability[$i][$j])
            {
                $total_hours += 1;
            }
        }
    }

    if($total_hours == 0)
    {
        $errors['availability'] = "Please enter your availability.";
    }
}

//there were errors with the registration - return error result
if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}


if(isset($_COOKIE['token']))
{
    $token = $_COOKIE['token'];
    $result = $db->user_bytoken($token);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);
    }
    else if(!is_null($result['result']))
    {
        $userid = $result['result']['id'];
    }
}

$result = $db->submit_jobapplication($jobid, $userid, $application_name, $application_email, $application_phone, $application_resume);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$applicationid = $result['result']['id'];

$result = $db->submit_jobapplicationavailability($applicationid, $application_availability, $AvailabilityDays_count, $AvailabilityCategories_count);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

$result = array('JobApplicationId' => $applicationid);
finish(true, $result);

?>

