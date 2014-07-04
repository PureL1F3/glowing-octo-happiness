<?php

require_once __DIR__ . '/vendor/autoload.php';

function GetHeaders($headers)
{
    foreach($headers as $name => $value)
    {
        if(!isset($_SERVER[$name]))
        {
            syslog(LOG_WARNING, "Bad request - missing required header $name");
            return result(false);
        }
        $headers[$name] =  $_SERVER[$name];
    }
    return result(true, $headers);
}

function GetPostParams($posts)
{
    foreach($posts as $name => $value)
    {
        if(!isset($_POST[$name]))
        {
            syslog(LOG_WARNING, "Bad request - missing required post parameter $name");
            return result(false);
        }
        $posts[$name] =  $_POST[$name];
    }
    return result(true, $posts);
}

function GetGetParams($gets)
{
    foreach($gets as $name => $value)
    {
        if(!isset($_GET[$name]))
        {
            syslog(LOG_WARNING, "Bad request - missing required get parameter $name");
            return result(false);
        }
        $gets[$name] =  $_GET[$name];
    }
    return result(true, $gets);
}

function result($ok, $value=NULL)
{
    $result = array('ok' => $ok, 'result' => $value);
    return $result;
}

function finish($ok=false, $value=NULL)
{
    $result = array('ok' => $ok, 'result' => $value);
    echo json_encode($result);
    exit();
}

function show($line)
{
    echo "<br/>$line<br/>";
}

function reg_validated_name($user, $maxlen)
{
    syslog(LOG_INFO, "Validating username $user");
    $user = trim($user);
    $len = strlen($user);
    if($len > $maxlen)
    {
        $user = NULL;
    }
    return $user;
}

function reg_validated_email($email)
{
    syslog(LOG_INFO, "Validating email $email");

    $email = trim($email);
    if(!filter_var($email,  FILTER_VALIDATE_EMAIL))
    {
        $email = NULL;
    }
    return $email;
}

function reg_validated_password($pwd, $minlen, $maxlen)
{
    syslog(LOG_INFO, "Validating password $pwd");
    $len = strlen($pwd);
    if($len < $minlen || $len > $maxlen)
    {
        $pwd = NULL;
    }

    return $pwd;
}

function reg_validated_account_option($option, $account_options)
{
    $option = intval($option);

    foreach($account_options as $account_option)
    {
        if($account_option['id'] == $option)
        {
            return $option;
        }
    }

    return null;
}

function reg_saltnhash($pwd, $pwd_hashlen)
{
    syslog(LOG_INFO, 'utility->reg_saltnhash: Generating salt and hash for password');
    $salt = bin2hex(mcrypt_create_iv($pwd_hashlen, MCRYPT_DEV_URANDOM));
    $hash = password_hash($pwd, PASSWORD_BCRYPT, array("salt" => $salt));
    $hash = substr($hash, 0, $pwd_hashlen);

    return result(true, array('salt' => $salt, 'hash' => $hash));
}

function reg_hash($pwd, $salt, $pwd_hashlen)
{
    $hash = password_hash($pwd, PASSWORD_BCRYPT, array("salt" => $salt));
    $hash = substr($hash, 0, $pwd_hashlen);
    return result(true, array('hash' => $hash));
}

function session_token($userid, $pwd_hashlen, $sessiontoken_maxlen)
{
    syslog(LOG_INFO, 'utility->session_token: Generating session token');
    $time = time();
    $sessionid = session_id();
    $salt = bin2hex(mcrypt_create_iv($pwd_hashlen, MCRYPT_DEV_URANDOM));
    $sessiontoken = bin2hex(password_hash("$userid/$time/$sessionid", PASSWORD_BCRYPT, array("salt" => $salt)));
    if(strlen($sessiontoken) > $sessiontoken_maxlen)
    {
        $sessiontoken = substr($session, 0, $sessiontoken_maxlen);
    }
    return $sessiontoken;
}

function jobpost_validated_address($addr, $maxlen)
{
    $addr = trim($addr);
    $len = strlen($addr);
    if($len > $maxlen)
    {
        $addr = NULL;
    }

    return $addr;
}

function jobpost_validated_option($opt)
{
    $opt = trim($opt);
    if(!is_int($opt))
    {
        $opt = NULL;
    }

    return intval($opt);
}

function jobpost_validated_bitoption($opt)
{
    $opt = trim($opt);
    if(!is_int($opt) or !(intval($opt) == 0 or intval($opt) == 1)) 
    {
        $opt = NULL;
    }
}

function jobpost_validated_employer($val, $minlen, $maxlen) {
    $val = trim($val);
    $len = strlen($val);
    if($len < $minlen || $len > $maxlen)
    {
        $val = NULL;
    }

    return $val;
}

function jobpost_validated_title($val, $minlen, $maxlen) {
    $val = trim($val);
    $len = strlen($val);
    if($len < $minlen || $len > $maxlen)
    {
        $val = NULL;
    }

    return $val;
}

function jobpost_validated_description($val, $minlen, $maxlen) {
    $val = trim($val);
    $len = strlen($val);
    if($len < $minlen || $len > $maxlen)
    {
        $val = NULL;
    }

    return $val;
}

function jobpost_validated_vq($val, $maxlen) {
    $val = trim($val);
    $len = strlen($val);
    if($len > $maxlen)
    {
        $val = NULL;
    }

    return $val;
}

function jobpost_validated_promo($val, $maxlen) {
    $val = trim($val);
    $len = strlen($val);
    if($len > $maxlen)
    {
        $val = NULL;
    }

    return $val;
}

function jobpost_validated_postdate($val) {
    $val = trim($val);
    $date_vals = explode('/', $val);
    $date = NULL;
    if(sizeof($date_vals) == 3) 
    {
        $month = intval($date_vals[0]);
        $day = intval($date_vals[1]);
        $year = intval($date_vals[2]);
        if(checkdate($month, $dau, $year))
        {
            $date = array('month' => $month, 'day' => $day, 'year' => $year);
        }
    }

    return $date;
}

?>