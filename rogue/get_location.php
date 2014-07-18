<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$code = '';

//get request for jobseeker dashboard jobs
$request = json_decode(file_get_contents('php://input'), true);
if(!isset($request['location']))
{
    finish(false, BAD_REQUEST);
}
else
{
    $code = strval($request['location']);
    $code_len = strlen($code);
    if($code_len < 1 || $code_len > MAX_LOCATION_LEN) {
        finish(false, BAD_REQUEST);
    }
}

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok'])
{
    finish(false, TECH_ISSUE);
}

$result = $db->get_location($code);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}

finish(true, $result['result']);
// return -> name, lat, lon
?>