<?php

if(isset($_POST['submit'])) {
    include_once('config.php');
    include_once('utility.php');
    include_once('streamhiredb.php');

    if(!isset($_COOKIE['token']))
    {
        return finish(false, $config['messages']['BadRequest']);
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
        return finish(false, $config['messages']['BadRequest']);
    }

    $date_of_expiry = time() - SESSION_TOKEN_LIFE_SECONDS; 
    setcookie( "token", $token, $date_of_expiry, "/");

    finish(true);
}
?>