<?php
    include_once('config.php');
    include_once('utility.php');
    include_once('streamhiredb.php');

    $params = array('cid' => '',
                    'f' => '');

    $result = GetGetParams($params);
    if(!$result['ok'])
    {
      return finish(false, $config['messages']['BadRequest']);
    }
    $cid = $result['result']['cid'];
    $f = $result['result']['f'];

    $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);
    $result = $db->connect();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['BadRequest']);
    }
    
    //check that country is valid
    $result = NULL;
    if($f == 'jcity')
    {
      $result = $db->cities_forcountry($cid);
    }
    else if($f == 'jfunc')
    {
      $result = $db->functions_forcountry($cid);
    }
    else if($f == 'jtype')
    {
      $result = $db->types_forcountry($cid);
    }
    else if($f == 'jopt')
    {
      $result = $db->joboptions_forcountry($cid);
    }

    if($result == NULL or !$result['ok'])
    {
      return finish(false, $config['messages']['BadRequest']);
    }

    finish(true, $result['result']);
?>