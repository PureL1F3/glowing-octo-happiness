<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$job_extension_days = 7;

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
    finish(false, BAD_REQUEST);
}
$job = $result['result'];

if($job['expired']) {
    $finish_data = array( 
        'type' => INVALID_EXTENDPOST_EXPIRED, 
        'data' => array(
            'expire_days' => $job['expire_days'],
            'expired' => $job['expired']
        )
    );
    finish(false, $finish_data);
}
elseif($job['expire_days'] >= $job_extension_days) {
    $finish_data = array( 
        'type' => INVALID_EXTENDPOST_TOOEARLY, 
        'data' => array(
            'expire_days' => $job['expire_days'],
            'expired' => $job['expired']
        )
    );
    finish(false, $finish_data);
}

$result = $db->extend_jobpost($jobid, $job_extension_days);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
$expiry_days = $result['result'];

$finish_data = array('expiry_days' => $expiry_days, 'expired' => $job['expired']);
finish(true, $finish_data);
?>
