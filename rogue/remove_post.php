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
$job = $result['result'];

if($job['expired'])
{
    //job is already expired - nothing to do
    finish(true);
}

$result = $db->expire_jobpost($jobid);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
finish(true);

?>