<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

$login = json_decode(file_get_contents('php://input'), true);
if(is_null($login))
{
    finish(false, BAD_REQUEST);
}

//login parameters 
$account_email = '';
$account_password = '';

//result values
$errors = array();
$login_result = null;

//get login parameters
$error_email = "Please enter a valid JobSeeker email.";
$error_password = "Invalid password (" . MIN_PASSWORD_LEN . " to " . MAX_PASSWORD_LEN . " characters).";
$error_invalid_login = "Invalid JobSeeker email/password.";

if(!isset($login['email'])) {
    $errors['email'] = $error_email;
}
else {
    $account_email = trim(strval($login['email']));
    if(!filter_var($account_email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = $error_email;
    }
}

if(!isset($login['password'])) {
    $errors['password'] = $error_password;
}
else {
    $account_password = strval($login['password']);
    $account_password_len = strlen($account_password);
    if($account_password_len < MIN_PASSWORD_LEN || $account_password_len > MAX_PASSWORD_LEN) {
        $errors['password'] = $error_password;
    }
}

//if we have invalid params return errors
if(count($errors) > 0) {
    $result = array('errors' => $errors);
    finish(true, $result);
}

$db = new StreamHireDB($config['database']['streamhire']['host'], 
    $config['database']['streamhire']['user'],
    $config['database']['streamhire']['pwd'],
    $config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}

$result = $db->user_byemail($account_email);
if(!$result['ok']) {
    finish(false, TECH_ISSUE);
}
else {
    if(is_null($result['result'])) {
        $errors['email'] = $error_invalid_login;
    }
    else
    {
        //check that our login is a jobseeker - if not redirect to employer login
        $user = $result['result'];
        if(!isset($user['jobseeker'])) {
            $errors['email'] = $error_invalid_login;
        }
        else
        {
            // check that login password is corrent
            $hash = reg_hash($account_password, $user['salt'], PWD_HASH_LENGTH);
            if($hash['result']['hash'] != $user['hash']) {
                $errors['email'] = $error_invalid_login;
            }
            else
            {
                // create a session for our login
                $token = session_token($user['id'], PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
                $result = $db->session_create($user['id'], $token);
                if(!$result['ok']) {
                    finish(false, TECH_ISSUE);
                }
                $date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
                setcookie( "token", $token, $date_of_expiry, "/");

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
                if(!$result['ok']) {
                    finish(false, TECH_ISSUE);
                }
                $jobfunctions = $result['result'];

                $login_result = array(
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
        }

    }
}

if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}

finish(true, $login_result);

?>