<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['jobid']) || intval($request['jobid']) <= 0)
{
    finish(false, BAD_REQUEST);
}
$jobid = intval($request['jobid']);

$result = $db->get_employer_jobpost($userid, $jobid);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
if(is_null($result['result']))
{
    finish(false, BAD_REQUEST);
}
$jobpost = $result['result'];
$jobpost['availability'] = get_empty_availability(TOTAL_DAYS_COUNT, TOTAL_PERIODS_COUNT);
$result = $db->get_jobpost_availability($jobid, $job)
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}