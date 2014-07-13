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

//login input
$login = json_decode(file_get_contents('php://input'), true);

//login parameters 
$account_email = '';
$account_password = '';

//login requirements
$MIN_PASSWORD_LEN = 6;
$MAX_PASSWORD_LEN = 12;

//errors for login
$errors = array();
$login_result = null;

if(!isset($login['email']))
{
    $errors['email'] = "E-mail is required.";
}
else
{
    $account_email = trim(strval($login['email']));
    if(!filter_var($account_email, FILTER_VALIDATE_EMAIL))
    {
        $errors['email'] = 'Invalid email.';
    }
}


if(!isset($login['password']))
{
    $errors['password'] = "Password is required.";
}
else
{
    $account_password = strval($login['password']);
    if(strlen($account_password) < $MIN_PASSWORD_LEN || strlen($account_password) > $MAX_PASSWORD_LEN)
    {
        $errors['password'] = 'Invalid password.';
    }
}

if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}

$result = $db->user_byemail($account_email);
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}
else
{
    if(is_null($result['result']))
    {
        $errors['email'] = 'Invalid email/password';
    }
    else
    {
        $user = $result['result'];
        if(!isset($user['employer'])) {
            $errors['email'] = 'Invalid account - that is not an employer account.';    
        }
        else
        {
            $hash = reg_hash($account_password, $user['salt'], PWD_HASH_LENGTH);
            if($hash['result']['hash'] != $user['hash'])
            {
                $errors['email'] = 'Invalid email/password';
            }
            else
            {
                $token = session_token($user['id'], PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
                $result = $db->session_create($user['id'], $token);
                if(!$result['ok'])
                {
                    finish(false, $config['canned_msg']['technical_difficulty']);
                }
                $date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
                setcookie( "token", $token, $date_of_expiry, "/");

                $login_result = array(
                    'account' => array('name' => $user['name'], 'email' => $user['email'], 'phone' => $user['phone']),
                    'employer' => array('name' => $user['employer']['name'], 'description' => $user['employer']['description'], 'website' => $user['employer']['website']));
            }            
        }

    }
}

if(count($errors) > 0)
{
    $result = array('errors' => $errors);
    finish(true, $result);
}
else
{
    finish(true, $login_result);
}

?>