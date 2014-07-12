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

//registration parameters
$employer_name = '';
$employer_description = '';
$employer_url = '';
$account_name = '';
$account_email = '';
$account_phone = '';
$account_password = '';

//requirements for registration parameters
$MAX_NAME_LEN = 100;
$MAX_DESCRIPTION_LEN = 500;
$MAX_PHONE_LEN = 15;
$MIN_PASSWORD_LEN = 6;
$MAX_PASSWORD_LEN = 12;

//errors for registration
$errors = array();

if(!isset($registration['name']))
{
    $errors['name'] = "Employer name is required.";
}
else
{
    $employer_name = trim(strval($registration['name']));
    $employer_name_len = strlen($employer_name);
    if($employer_name_len < 1 || $employer_name_len > $MAX_NAME_LEN)
    {
        $errors['name'] = "Employer name must be 1 to $MAX_NAME_LEN characters.";
    }    
}

if(isset($registration['description']))
{
    $employer_description = trim(strval($registration['description']));
    $employer_description_len = strlen($employer_description);
    if($employer_description > $MAX_NAME_LEN)
    {
        $errors['description'] = "Employer description must be max $MAX_DESCRIPTION_LEN characters.";
    }
}

if(isset($registration['website']))
{
    $employer_url = trim(strval($registration['website']));
    if(strlen($employer_url) > 0 && !filter_var($employer_url, FILTER_VALIDATE_URL))
    {
        $errors['website'] = "That is not a valid url.";    
    }
}

if(!isset($registration['account']))
{
    $errors['account'] = array( 'name' => 'Account holder name is required.',
                                'email' => 'Email is required.',
                                'password' => 'Password is required.');
}
else
{
    $errors['account'] = array();

    $account = $registration['account'];
    if(!isset($account['name']))
    {
        $errors['account']['name'] = 'Account holder name is required.';
    }
    else
    {    
        $account_name = trim(strval($account['name']));
        $account_name_len = strlen($account_name);
        if($account_name_len < 1 || $account_name_len > $MAX_NAME_LEN)
        {
            $errors['account']['name'] = "Account holder name must be 1 to $MAX_NAME_LEN characters.";
        }
    }

    if(!isset($account['email']))
    {
        $errors['account']['email'] = 'Account email is required.';
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
            $errors['account']['password'] = "Password must be $MIN_PASSWORD_LEN to $MAX_PASSWORD_LEN.";
        }
    }

    if(count($errors['account']) == 0){
        unset($errors['account']);
    }
}

//there were errors with the registration - return error result
if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}

//register employer in db
$saltnhash = reg_saltnhash($account_password, PWD_HASH_LENGTH);
$result = $db->register_employer($employer_name, $employer_description, $employer_url, $account_name, $account_email, $account_phone, $saltnhash['result']['salt'], $saltnhash['result']['hash']);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
$userid = $result['result']['id'];

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
    'employer' => array('name' => $employer_name, 'description' => $employer_description, 'website' => $employer_url));

//return successful registration
finish(true, $result);
?>