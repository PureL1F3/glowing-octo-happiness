<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

//get request for jobseeker dashboard jobs
$request = json_decode(file_get_contents('php://input'), true);
//get type of jobs we're looking for
$Valid_types = array('Applied', 'Invited');
if(!isset($request['type']) || !in_array(strval($request['type']), $Valid_types))
{
    finish(false, BAD_REQUEST);
}
$type = strval($request['type']);

//get which page we're looking for
if(!isset($request['page']) || intval($request['page']) <= 0)
{
    finish(false, BAD_REQUEST);
}
$page = intval($request['page']);
$result_count = 10;

//make sure we are valid for this request
if(!isset($_COOKIE['token']))
{
    finish(false, NO_LOGIN);
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
elseif(is_null($result['result']) || !isset($result['result']['jobseeker']))
{
    finish(false, NO_LOGIN);
}
$user = $result['result'];

// get our stats for dashboard jobs
$result = $db->get_jobseeker_applied_jobs_count($user['id']);
if(!$result['ok']){
    finish(false, TECH_ISSUE);
}
$applied_jobs_count = $result['result'];

$result = $db->get_jobseeker_invited_jobs_count($user['id']);
if(!$result['ok']){
    finish(false, TECH_ISSUE);
}
$invited_jobs_count = $result['result'];

$start = 0;
$end = 0;
$total = 0;
$job_results = null;
if($type == 'Applied') {
    $total = $applied_jobs_count;
    $result = $db->get_jobseeker_applied_jobs($user['id'], $page, $result_count);
    if(!$result['ok']){
        finish(false, TECH_ISSUE);
    }
    $applications = $result['result'];
    if(count($applications) > 0) {
        $job_results = array();
        $applicationids = array_keys($applications);
        $result = $db->get_jobseeker_application_stats($applicationids);
        if(!$result['ok']){
            finish(false, TECH_ISSUE);
        }
        $stats = $result['result'];
        foreach($applicationids as $j) {
            $applications[$j]['hours_total'] = $stats[$j]['job_hours'];
            $applications[$j]['hours_match'] = $stats[$j]['match_hours'];
            $applications[$j]['hours_available'] =  $stats[$j]['availability_hours'];
            $applications[$j]['match_pct'] = 0;
            $applications[$j]['coverage_pct'] = 0;
            if($stats[$j]['job_hours'] > 0) {
                $applications[$j]['match_pct'] = $stats[$j]['match_hours'] / $stats[$j]['job_hours'];                   
            }
            if($stats[$j]['availability_hours'] > 0) {
                $applications[$j]['coverage_pct'] = $stats[$j]['match_hours'] / $stats[$j]['availability_hours'];
            }
            array_push($job_results, $applications[$j]);
        }
    }
}
else if($type == 'Invited') {
    $total = $invited_jobs_count;
    $result = $db->get_jobseeker_invited_jobs($user['id'], $page, $result_count);
    if(!$result['ok']){
        finish(false, TECH_ISSUE);
    }
    $jobs = $result['result'];
    if(count($jobs) > 0) {
        $job_results = array();
        $jobids = array_keys($jobs);
        $result = $db->get_jobseeker_jobs_stats($user['id'], $jobids);
        if(!$result['ok']){
            finish(false, TECH_ISSUE);
        }
        $stats = $result['result'];
        foreach($jobids as $j) {
            $jobs[$j]['hours_total'] = $stats[$j]['job_hours'];
            $jobs[$j]['hours_match'] = $stats[$j]['match_hours'];
            $jobs[$j]['hours_available'] =  $stats[$j]['availability_hours'];
            $jobs[$j]['match_pct'] = 0;
            $jobs[$j]['coverage_pct'] = 0;
            if($stats[$j]['job_hours'] > 0) {
                $jobs[$j]['match_pct'] = $stats[$j]['match_hours'] / $stats[$j]['job_hours'];
            }
            if($stats[$j]['availability_hours']){
                $jobs[$j]['coverage_pct'] = $stats[$j]['match_hours'] / $stats[$j]['availability_hours'];
            }
            array_push($job_results, $jobs[$j]);
        }
    }
}

if(count($job_results) > 0) {
    $start = ($page  - 1) * $result_count + 1;

    if(count($job_results) == $result_count) {
        $end = $page * $result_count;
    }
    else
    {
        $end = $total;
    }
}

$result = array(
    'total_applied' => $applied_jobs_count,
    'total_invitations' => $invited_jobs_count,
    'jobs' => array(
            'type' => $type,
            'start' => $start,
            'end' => $end,
            'total' => $total,
            'items' => $job_results
        )
    );

finish(true, $result);
?>