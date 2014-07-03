<?php

if(isset($_POST['submit'])) {
    include_once('config.php');
    include_once('utility.php');
    include_once('streamhiredb.php');

    $params = array('regname' => '', 'regemail' => '', 'regpwd' => '');
    $reg_postparams = GetPostParams($params);

    if(!$reg_postparams['ok'])
    {
        return finish(false, $config['messages']['BadRequest']);
    }

    $regname = reg_validated_name($reg_postparams['result']['regname'], REGISTRATION_NAME_MINCHAR, REGISTRATION_NAME_MAXCHAR);
    if(is_null($regname))
    {
        return finish(false, $config['messages']['BadRegUser']);
    }
    $regemail = reg_validated_email($reg_postparams['result']['regemail']);
    if(is_null($regemail))
    {
        return finish(false, $config['messages']['BadRegEmail']);
    }
    $regpwd = reg_validated_password($reg_postparams['result']['regpwd'], REGISTRATION_PWD_MINCHAR, REGISTRATION_PWD_MAXCHAR);
    if(is_null($regpwd))
    {
        return finish(false, $config['messages']['BadRegPwd']);
    }

    $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);


    $result = $db->connect();
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    
    $result = $db->user_id_byemail($regemail);
    if(!is_null($result['result']))
    {
        return finish(false, $config['messages']['BadRegDuplicateEmail']);
    }

    $saltnhash = reg_saltnhash($regpwd, PWD_HASH_LENGTH);
    $result = $db->user_create($regname, $saltnhash['result']['salt'], $saltnhash['result']['hash'], $regemail);
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }

    $userid = $result['result']['id'];
    $token = session_token($userid, PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
    $result = $db->session_create($userid, $token);
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }

    $date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
    setcookie( "token", $token, $date_of_expiry, "/");

    finish(true);
}
?>

<form action="Register.php" method="POST">
    <div class="form-group">
        <input type="text" name="regname" placeholder="Name" />
    </div>
    <div class="form-group">
        <input type="text" name="regemail" placeholder="E-Mail" />
    </div>
    <div class="form-group">
        <input type="password" name="regpwd" placeholder="Password(6 - 12 characters)" />
    </div>
    <div class="form-group">
        <button type="submit" class="btn">Register</button>
    </div>
</form>