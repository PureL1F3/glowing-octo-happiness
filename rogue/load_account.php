<?php
include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$account_result = null;

//get cookie token or return no account
if(!isset($_COOKIE['token'])){
    finish(true, $account_result);
}
$token = $_COOKIE['token'];

//connect to database
$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok']){
    finish(false, TECH_ISSUE);
}

// get user by token
$result = $db->user_bytoken($token);
if(!$result['ok']){
    finish(false, TECH_ISSUE);
}
else if(is_null($result['result'])){
    finish(true, $account_result);
}
$user = $result['result'];

//check if our user is a jobseeker or employer - load the right account
if(isset($user['jobseeker']))
{
    $availability = get_empty_availability(TOTAL_DAYS_COUNT, TOTAL_PERIODS_COUNT);
    $result = $db->user_availability($user['id'], $availability);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    $availability = $result['result'];

    $result = $db->user_jobtypes($user['id']);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    $jobtypes = $result['result'];

    $result = $db->user_jobfunctions($user['id']);
    if(!$result['ok']){
        finish(false, TECH_ISSUE);
    }
    $jobfunctions = $result['result'];

    $account_result = array(
        'account' => array(
            'name' => $user['name'], 
            'email' => $user['email'], 
            'phone' => $user['phone']),
        'jobseeker' => array(   
            'resume' => $user['jobseeker']['resume'], 
            'availability' => $availability, 
            'jobtypes' => $jobtypes, 
            'jobfunctions' => $jobfunctions,
            'location' => array(
                'name' => $user['jobseeker']['location'], 
                'lat' => $user['jobseeker']['lat'],
                'lon' => $user['jobseeker']['lon'])));
}
else
{
    $account_result = array(
        'account' => array(
            'name' => $user['name'], 
            'email' => $user['email'], 
            'phone' => $user['phone']),
        'employer' => array(
            'name' => $user['employer']['name'], 
            'description' => $user['employer']['description'], 
            'website' => $user['employer']['website']));
}

finish(true, $account_result);
?>