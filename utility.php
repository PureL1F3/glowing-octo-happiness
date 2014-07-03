<?php

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

function reg_validated_name($user, minlen, maxlen)
{
    $user = trim($user);
    $len = strlen($user);
    if($len < $minlen || $len > $maxlen)
    {
        $user = NULL;
    }
    return $user;
}

function reg_validated_email($email)
{
    $email = trim($email);
    if(!filter_var($email,  FILTER_VALIDATE_EMAIL))
    {
        $email = NULL;
    }
    return $email;
}

function reg_validated_password($pwd, $minlen, $maxlen)
{
    $len = strlen($pwd);
    if($len < $minlen || $len > $maxlen)
    {
        $pwd = NULL;
    }

    return $pwd;
}

function reg_saltnhash($pwd, $pwd_hashlen)
{
    syslog(LOG_INFO, 'utility->reg_saltnhash: Generating salt and hash for password');
    $salt = bin2hex(mcrypt_create_iv($pwd_hashlen, MCRYPT_DEV_URANDOM));
    $hash = password_hash($pwd, PASSWORD_BCRYPT, array("salt" => $salt));

    return result(true, array('salt' => $salt, 'hash' => $hash));
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

?>