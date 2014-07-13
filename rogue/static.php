<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}


$jobtypes = null;
$jobfunctions = null;


$result = $db->jobtypes();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else
{
    $jobtypes = $result['result'];
}

$result = $db->jobfunctions();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else
{
    $jobfunctions = $result['result'];
}

$result = array('jobtypes' => $jobtypes, 'jobfunctions' => $jobfunctions);
finish(true, $result);

?>