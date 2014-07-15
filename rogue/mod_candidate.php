<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$job_extension_days = 7;

$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['jobid']) || intval($request['jobid']) <= 0)
{
    finish(false, 'Bad request.');
}
$jobid = intval($request['jobid']);

if(!isset($request['applicationid']) || intval($request['applicationid']) <= 0)
{
    finish(false, 'Bad request.');
}
$applicationid = intval($request['applicationid']);

$mod = strval($request['applicationid']);
if($mod == 'yes')
{
    $mod = 1;
}
else if($mod == 'no')
{
    $mod = 0;
}
else
{
    finish(false, 'Bad request.');    
}


if(!isset($_COOKIE['token']))
{
    return finish(false, "You need to be logged in to view this page.");
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
    finish(false, "You need to be logged in to view this page.");
}
$userid = $result['result']['id'];

$result = $db->get_employer_jobpost($userid, $jobid);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else if(is_null($result['result']))
{
    finish(false, "Invalid job id.");
}

$result = $db->modify_jobcandidate($jobid, $applicationid, $mod);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
finish(true);

?>