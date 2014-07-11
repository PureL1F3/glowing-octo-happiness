<?php
include_once('/var/www/html/secondcrack/php/config.php');
include_once('/var/www/html/secondcrack/php/utility.php');
include_once('/var/www/html/secondcrack/php/streamhiredb.php');

if(!isset($_COOKIE['token']))
{
    return finish(false, $config['messages']['NotLoggedIn']);
}

$token = $_COOKIE['token'];

$db = new StreamHireDB($config['database']['streamhire']['host'],
    $config['database']['streamhire']['user'],
    $config['database']['streamhire']['pwd'],
    $config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok'])
{
    return finish(false, $config['messages']['TechFail']);
}

$result = $db->session_kill($token);
if(!$result['ok'])
{
    return finish(false, $config['messages']['NotLoggedIn']);
}

$date_of_expiry = time() - SESSION_TOKEN_LIFE_SECONDS; 
setcookie( "token", $token, $date_of_expiry, "/");

finish(true);
?>