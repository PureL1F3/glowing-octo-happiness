<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['jobid']) || intval($request['jobid']) <= 0) {
    finish(false, BAD_REQUEST);
}
$jobid = intval($request['jobid']);

if(!isset($_COOKIE['token'])) {
    finish(false, NOT_AUTH);
}
$token = $_COOKIE['token'];

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}

$result = $db->user_bytoken($token);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
else if(is_null($result['result'])) {
    finish(false, NOT_AUTH);
}
$userid = $result['result']['id'];

$result = $db->get_employer_jobpost($userid, $jobid);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
else if(is_null($result['result'])) {
    //employer is not owner of this jobpost
    finish(false, BAD_REQUEST);
}
$job = $result['result'];

if($job['expired']) {
    $expire_data = array(
        'expire_days' => $job['expire_days'],
        'expired' => $job['expired']
    );   
    finish(true, $expire_data);
}

$result = $db->expire_jobpost($jobid);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}

$expire_data = array(
    'expire_days' => 0,
    'expired' => true
);
finish(true, $expire_data);
?>