<?php

    include_once('/var/www/html/secondcrack/php/config.php');
    include_once('/var/www/html/secondcrack/php/utility.php');
    include_once('/var/www/html/secondcrack/php/streamhiredb.php');

    $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);

    $job_cities = null;
    $job_functions = null;
    $job_types = null;
    $job_options = null;

    $result = $db->connect();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    
    $result = $db->job_cities();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    $job_cities = $result['result'];

    $result = $db->job_functions();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    $job_functions = $result['result'];

    $result = $db->job_types();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    $job_types = $result['result'];

    $result = $db->jobpost_publicoptions();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    $job_options = $result['result'];

    $result = array('cities' => $job_cities,
                    'functions' => $job_functions,
                    'types' => $job_types,
                    'postoptions' => $job_options);

    finish(true, $result);
?>