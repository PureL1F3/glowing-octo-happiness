<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['page']) || intval($request['page']) <= 0) {
    finish(false, BAD_REQUEST);
}

$page = intval($request['page']);
$result_count = 10;
if(!isset($_COOKIE['token'])) {
    return finish(false, BAD_REQUEST);
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

$result = $db->get_employer_jobposts($userid, $page, $result_count);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
$jobs = $result['result'];

$result = $db->get_totalcount();
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
$total = $result['result'];
$start = 0;
$end = 0;
if(count($jobs) > 0) {
    $start = ($page - 1) * $result_count + 1;
    if(count($jobs) == $result_count) {
        $end = $page * $result_count;
    } else {
        $end = $total;
    }
}

$result = array('jobs' => $jobs, 'start' => $start, 'end' => $end, 'total' => $total);
finish(true, $result);
?>
