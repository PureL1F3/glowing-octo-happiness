<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$jobid = 0;
$candidate_type = '';
$page = 0;
$valid_candidate_types = array('Yes', 'No', 'New');
$result_count = 10;
$AvailabilityCategories = array('6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM');
$AvailabilityDays = array('M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun');

//registration input
$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['jobid']) || intval($request['jobid']) <= 0)
{
    finish(false, 'Bad request.');
}
if(!isset($request['candidate_type']) || !in_array(strval($request['candidate_type']),$valid_candidate_types))
{
    finish(false, 'Bad request.');
}
if(!isset($request['page']) || intval($request['page']) <= 0)
{
    finish(false, 'Bad request.');
}


$jobid = intval($request['jobid']);
$candidate_type = strval($request['candidate_type']);
$page = intval($request['page']);

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
for($i = 0; $i < count($AvailabilityDays) ; $i++)
{
    $job['availability'][$i] = array();
    for($j = 0; $j < count($AvailabilityCategories); $j++)
    {
        $job['availability'][$i][$j] = false;
    }
}
$result = $db->get_jobpost_availability($jobid, $job);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);    
}
$job = $result['result'];

$result = $db->get_employer_jobpost_candidates($userid, $jobid, $candidate_type, $page, $result_count);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);    
}
$candidates = $result['result'];
if(count($candidates) > 0)
{
    foreach($candidates as $candidate_id=>$candidate)
    {
        $candidates[$candidate_id]['availability'] = array();
        for($i = 0; $i < count($AvailabilityDays); $i++)
        {
            $candidates[$candidate_id]['availability'][$i] = array();
            for($j = 0; $j < count($AvailabilityCategories); $j++)
            {
                $candidates[$candidate_id]['availability'][$i][$j] = false;
            }
        }
    }
    $result = $db->get_candidates_availability($userid, $jobid, $candidates, $job);
    if(!$result['ok'])
    {
        finish(false, $config['canned_msg']['technical_difficulty']);    
    }
    $candidates = $result['result'];
}

$result = array('job' => $job, 'candidates' => $candidates);
finish(true, $result);
?>

