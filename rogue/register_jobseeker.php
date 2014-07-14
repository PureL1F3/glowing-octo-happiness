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

//registration input
$registration = json_decode(file_get_contents('php://input'), true);

$AvailabilityCategories = array('6AM-10AM', '10AM-2PM', '2PM-6PM', '6PM-10PM', '10PM-2AM', '2AM-6AM');
$AvailabilityDays = array('M', 'T', 'W', 'Th', 'F', 'Sat', 'Sun');

$ValidDistances = array(5, 10, 25, 50, 100);

$result = $db->jobtypes(true);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$Valid_jobtypes = $result['result'];

$result = $db->jobfunctions(true);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$Valid_jobfunctions = $result['result'];

//registration parameters
$account_name = '';
$account_email = '';
$account_phone = '';
$account_password = '';

$availability = array();
$resume = '';

$location_name = '';
$location_lat = 0;
$location_lon = 0;
$radius = 0;

$jobfunctions = array();
$jobtypes = array();

//requirements for registration parameters
$MAX_NAME_LEN = 100;
$MAX_RESUME_LEN = 5000;
$MAX_PHONE_LEN = 15;
$MIN_PASSWORD_LEN = 6;
$MAX_PASSWORD_LEN = 12;
$MAX_LOCATION_LEN = 10;

//errors for registration
$errors = array();

if(!isset($registration['account']))
{
    $errors['account'] = array( 'name' => 'Your name is required.',
                                'email' => 'E-mail is required.',
                                'password' => 'Password is required.');
}
else
{
    $errors['account'] = array();

    $account = $registration['account'];
    if(!isset($account['name']))
    {
        $errors['account']['name'] = 'Your  name is required.';
    }
    else
    {    
        $account_name = trim(strval($account['name']));
        $account_name_len = strlen($account_name);
        if($account_name_len < 1 || $account_name_len > $MAX_NAME_LEN)
        {
            $errors['account']['name'] = "Please enter your name up to a max $MAX_NAME_LEN characters.";
        }
    }

    if(!isset($account['email']))
    {
        $errors['account']['email'] = 'Please enter your e-mail.';
    }
    else
    {    
        $account_email = trim(strval($account['email']));
        if(!filter_var($account_email, FILTER_VALIDATE_EMAIL))
        {
            $errors['account']['email'] = 'That is not a valid e-mail.';
        }
        else 
        {
            $result = $db->user_byemail($account_email);
            if(!$result['ok'])
            {
                finish(false, $config['canned_msg']['technical_difficulty']);
            }
            else
            {
                if(!is_null($result['result']))
                {
                    $errors['account']['email'] = 'Sorry that e-mail is already registered - please login or use a different e-mail.';
                }
            }
        }
    }

    if(isset($account['phone']))
    {
        $account_phone = trim(strval($account['phone']));
        $account_phone_len = strlen($account_phone);
        if($account_phone_len > $MAX_PHONE_LEN)
        {
            $errors['account']['phone'] = "Phone number must be max $MAX_PHONE_LEN characters.";
        }
    }

    if(!isset($account['password']))
    {
        $errors['account']['password'] = 'Account password is required.';
    }
    else
    {    
        $account_password = strval($account['password']);
        $account_password_len = strlen($account_password);
        if($account_password_len < $MIN_PASSWORD_LEN || $account_password_len > $MAX_PASSWORD_LEN)
        {
            $errors['account']['password'] = "Password must be $MIN_PASSWORD_LEN to $MAX_PASSWORD_LEN characters.";
        }
    }

    if(count($errors['account']) == 0){
        unset($errors['account']);
    }
}


if(!isset($registration['availability']))
{
    $errors['availability'] = "Availability is required.";
}
else
{
    $AvailabilityCategories_count = count($AvailabilityCategories);
    $AvailabilityDays_count = count($AvailabilityDays);
    $total_hours = 0;

    for($i = 0; $i < $AvailabilityDays_count; $i++)
    {
        if(!isset($registration['availability'][$i]))
        {
            break;
        }
        $availability[$i] = array();
        for($j = 0; $j < $AvailabilityCategories_count; $j++)
        {
            if(!isset($registration['availability'][$i][$j]) || !is_bool($registration['availability'][$i][$j]))
            {
                $i = $AvailabilityDays_count;
                break;
            }
            $availability[$i][$j] = $registration['availability'][$i][$j];

            if($availability[$i][$j])
            {
                $total_hours += 1;
            }
        }
    }

    if($total_hours == 0)
    {
        $errors['availability'] = "Please enter your availability.";
    }
}

if(!isset($registration['resume']))
{
    $errors['resume'] = "Resume is required.";
}
else
{
    $resume = trim(strval($registration['resume']));
    $resume_len = strlen($resume);
    if($resume_len < 1 || $resume_len > $MAX_RESUME_LEN)
    {
        $errors['resume'] = "Please enter your resume up to $MAX_RESUME_LEN characters.";
    }    
}

if(!isset($registration['location']))
{
    $errors['location'] = "Location is required.";
}
else
{
    $location = $registration['location'];
    if(!isset($location['name']) || !isset($location['lat']) || !isset($location['lon']) )
    {
        $errors['location'] = "Location is required.";
    }
    else
    {
        $location_name = trim(strval($location['name']));
        $location_name_len = strlen($location_name);
        if($location_name_len < 1 || $location_name_len > $MAX_LOCATION_LEN)
        {
            $errors['location'] = "Location is required and can be max $MAX_LOCATION_LEN characters.";
        }
        else
        {
            $location_lat = floatval($location['lat']);
            $location_lon = floatval($location['lon']);
            if(abs($location_lat) > 90 || abs($location_lon) > 180)
            {
                $errors['location'] = "Please enter a valid location.";
            }
        }
    }
}

if(!isset($registration['distance']))
{
    $errors['distance'] = "Please enter a valid job search distance.";
}
else
{
    $distance = intval($registration['distance']);
    $valid = false;
    foreach($ValidDistances as $d)
    {
        if($d == $distance)
        {
            $valid = true;
        }
    }

    if(!$valid)
    {
        $errors['distance'] = "Please enter a valid job search distance.";
    }    
}


if(!isset($registration['jobfunctions']) || !is_array($registration['jobfunctions']))
{
    $errors['jobfunctions'] = "Please select the job function(s) you are interested in.";
}
else
{
    $jobfunctions = $registration['jobfunctions'];
    $valid = false;
    foreach($jobfunctions as $f)
    {
        if(in_array($f, $Valid_jobfunctions))
        {
            $valid = true;
        }
        else
        {
            break;
        }
    }

    if(!$valid)
    {
        $errors['jobfunctions'] = "Please select the job function(s) you are interested in.";
    }    
}

if(!isset($registration['jobtypes']) || !is_array($registration['jobtypes']))
{
    $errors['jobtypes'] = "Please select the job type(s) you are interested in.";
}
else
{
    $jobtypes = $registration['jobtypes'];
    $valid = false;
    foreach($jobtypes as $t)
    {
        if(in_array($t, $Valid_jobtypes))
        {
            $valid = true;
        }
        else
        {
            break;
        }
    }

    if(!$valid)
    {
        $errors['jobtypes'] = "Please select the job type(s) you are interested in.";
    }    
}

//there were errors with the registration - return error result
if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}

//register jobseeker in db
$saltnhash = reg_saltnhash($account_password, PWD_HASH_LENGTH);
$result = $db->create_jobseeker($account_name, $account_email, $account_phone, 
                $resume, $location_name, $location_lat, 
                $location_lon, $radius, $saltnhash['result']['salt'], $saltnhash['result']['hash']);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$userid = $result['result']['id'];

$result = $db->create_jobseeker_jobtypes($userid, $jobtypes);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

$result = $db->create_jobseeker_jobfunctions($userid, $jobfunctions);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

$result = $db->create_jobseeker_availability($userid, $availability, $AvailabilityDays_count, $AvailabilityCategories_count);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

//generate session for user 
$token = session_token($userid, PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
$result = $db->session_create($userid, $token);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
setcookie( "token", $token, $date_of_expiry, "/");

$result = array(
    'account' => array('name' => $account_name, 'email' => $account_email, 'phone' => $account_phone),
    'jobseeker' => array(   'resume' => $resume, 'availability' => $availability, 
                            'jobtypes' => $jobtypes, 'jobfunctions' => $jobfunctions,
                            'location' => array('name' => $location_name, 
                            'lat' => $location_lat, 'lon' => $location_lon)));
//return successful registration
finish(true, $result);
?>