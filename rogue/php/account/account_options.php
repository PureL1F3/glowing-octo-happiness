<?php

    include_once('/var/www/html/secondcrack/php/config.php');
    include_once('/var/www/html/secondcrack/php/utility.php');
    include_once('/var/www/html/secondcrack/php/streamhiredb.php');

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

    finish(true, $result['result']);
?>