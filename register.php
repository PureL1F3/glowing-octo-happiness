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

    $saltnhash = reg_saltnhash($pwd, PWD_HASH_LENGTH);

    $userid = 123;
    $token = session_token($userid, PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);

    $date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
    setcookie( "token", $token, $date_of_expiry);

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