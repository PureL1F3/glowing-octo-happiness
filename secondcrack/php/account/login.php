<?php
include_once('/var/www/html/secondcrack/php/config.php');
include_once('/var/www/html/secondcrack/php/utility.php');
include_once('/var/www/html/secondcrack/php/streamhiredb.php');


$params = array('regname' => '', 'regemail' => '', 'regpwd' => '', 'regtype' => '');
$result = GetPostParams($params);
if(!$result['ok'])
{
    return finish(false, $config['messages']['BadRequest']);
}

$regname = reg_validated_name($result['result']['regname'], REGISTRATION_NAME_MAXCHAR);
if(is_null($regname))
{
    return finish(false, $config['messages']['BadRegUser']);
}

$regemail = reg_validated_email($result['result']['regemail']);
if(is_null($regemail))
{
    return finish(false, $config['messages']['BadRegEmail']);
}

$regpwd = reg_validated_password($result['result']['regpwd'], REGISTRATION_PWD_MINCHAR, REGISTRATION_PWD_MAXCHAR);
if(is_null($regpwd))
{
    return finish(false, $config['messages']['BadRegPwd']);
}
$regtype = $result['result']['regtype'];

$db = new StreamHireDB($config['database']['streamhire']['host'],
    $config['database']['streamhire']['user'],
    $config['database']['streamhire']['pwd'],
    $config['database']['streamhire']['db']);

$result = $db->connect();
if(!$result['ok'])
{
    return finish(false, $config['messages']['TechFail']);
}

$result = $db->account_options();
if(!$result['ok'])
{
    return finish(false, $config['messages']['TechFail']);
}

$regtype = reg_validated_account_option($regtype, $result['result']);
if(is_null($regtype))
{
    return finish(false, $config['messages']['BadRequest']);
}

$userid = null;
$result = $db->user_byemail($regemail);
if(is_null($result['result']))
{
    //registration
    $saltnhash = reg_saltnhash($regpwd, PWD_HASH_LENGTH);
    $result = $db->user_create($regname, $saltnhash['result']['salt'], $saltnhash['result']['hash'], $regemail, $regtype);
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
}
else
{
    $hash_result = reg_hash($regpwd, $result['result']['salt'], PWD_HASH_LENGTH);
    if($result['result']['hash'] != $hash_result['result']['hash'])
    {
        return finish(false, $config['messages']['BadRegDuplicateEmailOrBadPassword']);
    }
    $userid = $result['result']['id'];
}

$token = session_token($userid, PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
$result = $db->session_create($userid, $token);
if(!$result['ok'])
{
    return finish(false, $config['messages']['TechFail']);
}

$date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
setcookie( "token", $token, $date_of_expiry, "/");

finish(true);

?>