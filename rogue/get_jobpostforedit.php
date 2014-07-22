<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

if(!isset($_COOKIE['token']))
{
    return finish(false, NOT_AUTH);
}
$token = $_COOKIE['token'];

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    finish(false, TECH_ISSUE);
}
$result = $db->user_bytoken($token);
if(!$result['ok'])
{
    finish(false, TECH_ISSUE);
}
else if(is_null($result['result']))
{
    finish(false, NOT_AUTH);
}
$userid = $result['result']['id'];

$jobid = null;
$job = null;
$jobpost = json_decode(file_get_contents('php://input'), true);
if(isset($jobpost['jobid']) and is_int($jobpost['jobid']) and intval($jobpost['jobid']) > 0)
{
    $jobid = intval($jobpost['jobid']);
    $result = $db->get_jobpost_complete($userid, $jobid);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    if(is_null($result['result'])) {
        finish(false, INVALID_EDITPOST_INVALIDJOB);
    }
    $job = $result['result'];
    if($job['expired'])
    {
        finish(false, INVALID_EDITPOST_EXPIRED);
    }
}
//extend jobpost with availability
$job['availability'] = get_empty_availability(TOTAL_DAYS_COUNT, TOTAL_PERIODS_COUNT);
$result = $db->get_jobpost_availability($jobid, $job);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
$job = $result['result'];

finish(true, $job);

?>
