<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$request = json_decode(file_get_contents('php://input'), true);
//check if we have any availability to compare against
$availability_hours = 0;
$availability = null;
if(isset($request['availability']))
{
    $availability = array();
    for($i = 0; $i < TOTAL_DAYS_COUNT; $i++)
    {
        if(!isset($request['availability'][$i]))
        {
            break;
        }
        $availability[$i] = array();
        for($j = 0; $j < TOTAL_PERIODS_COUNT; $j++)
        {
            if(!isset($request['availability'][$i][$j]) || !is_bool($request['availability'][$i][$j]))
            {
                $availability = null;
                $i = TOTAL_DAYS_COUNT;
                break;
            }
            $availability[$i][$j] = $request['availability'][$i][$j];

            if($availability[$i][$j])
            {
                $availability_hours += 1;
            }
        }
    }
}

//get jobid
if(!isset($request['jobid']) || intval($request['jobid']) <= 0)
{
    finish(false, BAD_REQUEST);
}
$jobid = intval($request['jobid']);

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
// get jobpost
$result = $db->get_jobpost_toview($jobid);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
if(is_null($result['result']))
{
    finish(false, BAD_REQUEST);
}
$job = $result['result'];

//get userid (optional)
$userid = null;
if(isset($_COOKIE['token']))
{
    $token = $_COOKIE['token'];
    $result = $db->user_bytoken($token);
    if(!$result['ok'])
    {
        finish(false, TECH_ISSUE);
    }
    else if(!is_null($result['result']))
    {
        $userid = $result['result']['id'];
    }
}

$job['applied'] = false;
$job['viewed'] = false;
if($userid) {
    //check if we have applied or viewed this jobpost before
    $result = $db->get_jobpost_hasapplied($userid, $jobid);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    $job['applied'] = $result['result'];
    $result = $db->get_jobpost_hasviewed($userid, $jobid);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    $job['viewed'] = $result['result'];
}

//extend jobpost with availability
$job['availability'] = get_empty_availability(TOTAL_DAYS_COUNT, TOTAL_PERIODS_COUNT);
$result = $db->get_jobpost_availability($jobid, $job);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
$job = $result['result'];

//extend jobpost with availability stats
$match_hours = 0;
$total_hours = 0;
for($i = 0; $i < TOTAL_DAYS_COUNT; $i++)
{
        for($j = 0; $j < TOTAL_PERIODS_COUNT; $j++)
        {
            if($job['availability'][$i][$j])
            {
                $total_hours++;

                if($availability_hours > 0 && $availability[$i][$j]) {
                    $match_hours++;
            }
        }
    }
}
$job['match_hours'] = $match_hours;
$job['total_hours'] = $total_hours;
$job['availability_hours'] = $availability_hours;

finish(true, $job);

?>