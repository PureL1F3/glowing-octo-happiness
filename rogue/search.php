<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

//preset will perform 100km search radius, return 10 job posts per fetch
$distance = 100;
$result_count = 10;
$keywords = ''; //- disabling keyword search for now

//params we will extract
$page = 0;
$location_name = '';
$location_lat = 0;
$location_lon = 0;
$distance = 100;

//errors handlers
$errors = array();
$availability_error = 'Please enter your availability.';
$location_error = 'Please enter your location';

//extract out request
$request = json_decode(file_get_contents('php://input'), true);


if(!isset($request['page']) || intval($request['page']) <= 0) {
    finish(false, BAD_REQUEST);
}
$page = intval($request['page']);

if(!isset($request['location']))
{
    $errors['location'] = $location_error;
}
else {
    $location = $request['location'];
    if( !isset($location['name']) || 
        !(isset($location['lat']) && is_float($location['lat'])) || 
        !(isset($location['lon']) && is_float($location['lat'])))
    {
        $errors['location'] = $location_error;
    }
    else
    {
        $location_name = strval($location['name']);
        $location_name_len = strlen($location_name);
        if($location_name_len < 1 || $location_name_len > MAX_LOCATION_LEN) {
            $errors['location'] = $location_error;
        }
        else
        {
            $location_lat = floatval($location['lat']);
            $location_lon = floatval($location['lon']);
        }
    }
}

$total_hours = 0;
$availability = array();
if(!isset($request['availability']))
{
    $errors['availability'] = $availability_error;
}
else
{
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
                $i = TOTAL_DAYS_COUNT;
                break;
            }
            $availability[$i][$j] = $request['availability'][$i][$j];

            if($availability[$i][$j])
            {
                $total_hours += 1;
            }
        }
    }
    if($total_hours == 0)
    {
        $errors['availability'] = $availability_error;
    }
}

if(count($errors) > 0) {
    finish(true, array('errors' => $errors));
}

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}

// get user id if logged in 
$userid = 0;
if(isset($_COOKIE['token'])) {
    $token = $_COOKIE['token'];
    $result = $db->user_bytoken($token);
    if(!$result['ok']) {
        finish(false, TECH_ISSUE);
    }
    else if(!is_null($result['result'])) {
        $userid = $result['result']['id'];
    }
}


//get jobs
$result = $db->job_search($userid, $keywords, $availability, $total_hours, $location_lat, 
            $location_lon, $distance, $page, $result_count);
if(!$result['ok'])
{
    finish(false, TECH_ISSUE);
}
$jobs = $result['result'];

//get pagination results
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
// finish off with results
$result_data = array('start' => $start, 'end' => $end, 'total' => $total, 'results' => $jobs);
finish(true, $result_data);
?>

