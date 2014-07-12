<?php

require_once '/var/www/html/vendor/autoload.php';

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


?>