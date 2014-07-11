<?php

if(isset($_POST['submit'])) {
    include_once('config.php');
    include_once('utility.php');
    include_once('streamhiredb.php');

    if(!isset($_COOKIE['token']))
    {
        return finish(false, $config['messages']['NotLoggedIn']);
    }
    $token = $_COOKIE['token'];

    $params = array('postaddr' => '',
                    'postcountry' => '',
                    'postcity' => '',
                    'postfunction' => '',
                    'posttype' => '',
                    'postemployer' => '',
                    'posttitle' => '',
                    'postdescription' => '',
                    'postintrovid' => '',
                    'postresume' => '',
                    'postcoverletter' => '',
                    'postlinkedin' => '',
                    'postwebsite' => '',
                    'postvq1' => '',
                    'postvq2' => '',
                    'postvq3' => '',
                    'postdate' => '',
                    'postoption' => '',
                    'postpromo' => '')
    $reg_postparams = GetPostParams($params);
    if(!$reg_postparams['ok'])
    {
        finish(false, $config['messages']['BadRequest']);
    }

    $postaddr = jobpost_validated_address($reg_postparams['result']['postaddr'], JOBPOST_ADDR_MAXCHAR);
    if(is_null($postaddr))
    {
        finish(false, $config['messages']['BadJobPostAddr']);
    }
    $postcountry = jobpost_validated_option($reg_postparams['result']['postcountry']);
    if(is_null($postcity))
    {
        finish(false, $config['messages']['BadJobPostCountry']);
    }
    $postcity = jobpost_validated_option($reg_postparams['result']['postcity']);
    if(is_null($postcity))
    {
        finish(false, $config['messages']['BadJobPostCity']);
    }
    $postfunction = jobpost_validated_option($reg_postparams['result']['postfunction']);
    if(is_null($postfunction))
    {
        finish(false, $config['messages']['BadJobPostFunction']);
    }
    $posttype = jobpost_validated_option($reg_postparams['result']['posttype']);
    if(is_null($posttype))
    {
        finish(false, $config['messages']['BadJobPostType']);
    }
    $postemployer = jobpost_validated_employer($reg_postparams['result']['postemployer'], JOBPOST_EMPLOYER_MINCHAR, JOBPOST_EMPLOYER_MAXCHAR);
    if(is_null($postemployer))
    {
        finish(false, $config['messages']['BadJobPostEmployer']);
    }
    $posttitle = jobpost_validated_title($reg_postparams['result']['posttitle'], JOBPOST_TITLE_MINCHAR, JOBPOST_TITLE_MAXCHAR);
    if(is_null($postemployer))
    {
        finish(false, $config['messages']['BadJobPostTitle']);
    }
    $postdescription = jobpost_validated_description($reg_postparams['result']['postdescription'], JOBPOST_DESCRIPTION_MINCHAR, JOBPOST_DESCRIPTION_MAXCHAR);
    if(is_null($postdescription))
    {
        finish(false, $config['messages']['BadJobPostDescription']);
    }
    $postintrovid = jobpost_validated_bitoption($reg_postparams['result']['postintrovid']);
    if(is_null($postintrovid))
    {
        finish(false, $config['messages']['BadJobPostIntroVid']);
    }
    $postresume = jobpost_validated_bitoption($reg_postparams['result']['postresume']);
    if(is_null($postresume))
    {
        finish(false, $config['messages']['BadJobPostResume']);
    }
    $postcoverletter = jobpost_validated_bitoption($reg_postparams['result']['postcoverletter']);
    if(is_null($postcoverletter))
    {
        finish(false, $config['messages']['BadJobPostCoverLetter']);
    }
    $postlinkedin = jobpost_validated_bitoption($reg_postparams['result']['postlinkedin']);
    if(is_null($postlinkedin))
    {
        finish(false, $config['messages']['BadJobPostLinkedin']);
    }
    $postwebsite = jobpost_validated_bitoption($reg_postparams['result']['postwebsite']);
    if(is_null($postwebsite))
    {
        finish(false, $config['messages']['BadJobPostWebsite']);
    }
    $postpostvq1 = jobpost_validated_vq($reg_postparams['result']['postvq1'], JOBPOST_VQ_MAXCHAR);
    if(is_null($postpostvq1))
    {
        finish(false, $config['messages']['BadJobPostVQ']);
    }
    $postpostvq2 = jobpost_validated_vq($reg_postparams['result']['postvq1'], JOBPOST_VQ_MAXCHAR);
    if(is_null($postpostvq2))
    {
        finish(false, $config['messages']['BadJobPostVQ']);
    }
    $postpostvq3 = jobpost_validated_vq($reg_postparams['result']['postvq1'], JOBPOST_VQ_MAXCHAR);
    if(is_null($postpostvq3))
    {
        finish(false, $config['messages']['BadJobPostVQ']);
    }
    $postdate = jobpost_validated_postdate($reg_postparams['result']['postdate']);
    if(is_null($postdate))
    {
        finish(false, $config['messages']['BadJobPostDate']);
    }
    $postoption = jobpost_validated_option($reg_postparams['result']['postoption']);
    if(is_null($postoption))
    {
        finish(false, $config['messages']['BadJobPostOption']);
    }
    $postpromo = jobpost_validated_promo($reg_postparams['result']['postpromo'], JOBPOST_PROMO_MAXCHAR);
    if(is_null($postpromo))
    {
        finish(false, $config['messages']['BadJobPostPromo']);
    }


    $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);
    $result = $db->connect();
    if(!$result['ok'])
    {
        finish(false, $config['messages']['TechFail']);
    }

    $result = $db->user_id_bytoken($token);
    if(!$result['ok'])
    {
        finish(false, $config['messages']['TechFail']);
    }
    else if(is_null($result['result']))
    {
        finish(false, $config['messages']['NotLoggedIn']);
    }
    $userid = $result['result']['id'];

    $result = $db->joboption_id_forpromo($postcountry, $postpromo);
    if(!$result['ok'])
    {
        finish(false, $config['messages']['TechFail']);
    }
    if(!is_null($result['ok']['result']))
    {
        $postoptionid = $result['ok']['result'];
    }


    $result = $db->jobpost_create($userid, $postaddr, $postcity, $postfunction, 
                        $posttype, $postemployer, $posttitle, $postdescription,
                        $postintrovid, $postresume, $postcoverletter, $postlinkedin,
                        $postwebsite, $postvq1, $postvq2, $postvq3, $postoption);
    if(!$result['ok'])
    {
        finish(false, $config['messages']['TechFail']);
    }

    finish(true, $result['result']);
}
?>