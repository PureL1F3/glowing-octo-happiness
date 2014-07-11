<?php

    include_once('/var/www/html/secondcrack/php/config.php');
    include_once('/var/www/html/secondcrack/php/utility.php');
    include_once('/var/www/html/secondcrack/php/streamhiredb.php');

    $data = file_get_contents("php://input");
    $job_post = json_decode($data, true);
    if(is_null($job_post))
    {
        finish(false, $config['messages']['BadRequest']);
    }

    $errors = array();                  //form input errors
    $error_message = '';                //form big error message
    $Account = null;                    //account information if login / register
    $ExpireAccount = false;
    $JobPostID = null;

    // form input validation fields
    $MAX_ADDRESS_LEN = 100;
    $MAX_EMPLOYER_LEN = 100;
    $MAX_TITLE_LEN = 100;
    $MAX_DESCRIPTION_LEN = 5000;
    $MAX_VQ_LEN = 500;
    $MIN_PASSWORD_LEN = 6;
    $MAX_PASSWORD_LEN = 12;

    $db = new StreamHireDB($config['database']['streamhire']['host'],
        $config['database']['streamhire']['user'],
        $config['database']['streamhire']['pwd'],
        $config['database']['streamhire']['db']);
    $result = $db->connect();
    if(!$result['ok'])
    {
        finish(false, $config['messages']['TechFail']);
    }

    //address -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating jobpost address");
    if(!isset($job_post['address']))
    {
        syslog(LOG_INFO, "OK - empty address");
        $job_post['address'] = '';
    }
    else if(strlen($job_post['address']) > $MAX_ADDRESS_LEN)
    {
        syslog(LOG_INFO, "ERROR - address too long");
        $errors['address'] = "Address must be max $MAX_ADDRESS_LEN characters.";
    }

    //city -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating jobpost city");
    if(!isset($job_post['city']))
    {
        syslog(LOG_INFO, "ERROR - missing city");
        $errors['city'] = "Please select a city";
    }
    else
    {
        $result = $db->city_isvalid($job_post['city']);
        if(!$result['ok'])
        {
            finish(false, $config['messages']['TechFail']);
        }
        else if(!$result['result'])
        {
            syslog(LOG_INFO, "ERROR - bad city");
            $errors['city'] = "Please select a city";
        }
    }

    //job function -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job function");
    if(!isset($job_post['jobfunction']))
    {
        syslog(LOG_INFO, "ERROR - missing job function");
        $errors['jobfunction'] = "Please select a job function";
    }
    else
    {
        $result = $db->jobfunction_isvalid($job_post['jobfunction']);
        if(!$result['ok'])
        {
            finish(false, $config['messages']['TechFail']);
        }
        else if(!$result['result'])
        {
            syslog(LOG_INFO, "ERROR bad job function");
            $errors['jobfunction'] = "Please select a job function";
        }
    }

    //job type -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job type");
    if(!isset($job_post['jobtype']))
    {
        syslog(LOG_INFO, "ERROR - missing job type");
        $errors['jobtype'] = "Please select a job type";
    }
    else
    {
        $result = $db->jobtype_isvalid($job_post['jobtype']);
        if(!$result['ok'])
        {
            finish(false, $config['messages']['TechFail']);
        }
        else if(!$result['result'])
        {
            syslog(LOG_INFO, "ERROR missing job type");
            $errors['jobtype'] = "Please select a job type";
        }
    }

    //employer -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating employer");
    if(!isset($job_post['employer']) || strlen($job_post['employer']) == 0)
    {
        syslog(LOG_INFO, "ERROR empty employer");
        $errors['employer'] = "Please enter an employer name";
    }
    else if(strlen($job_post['employer']) > $MAX_EMPLOYER_LEN)
    {
        syslog(LOG_INFO, "ERROR employer too long");
        $errors['employer'] = "Employer name must be max $MAX_EMPLOYER_LEN characters.";
    }

    //job title -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job title");
    if(!isset($job_post['title']) || strlen($job_post['title']) == 0)
    {
        syslog(LOG_INFO, "ERROR empty job title");
        $errors['title'] = "Please enter a job title";
    }
    else if(strlen($job_post['title']) > $MAX_TITLE_LEN)
    {
        syslog(LOG_INFO, "ERROR job title too long");
        $errors['title'] = "Job title must be max $MAX_TITLE_LEN characters.";
    }

    //introvid
    syslog(LOG_INFO, "Validating introvid");
    if(!is_bool($job_post['introvid']))
    {
        syslog(LOG_INFO, "ERROR introvid not a bool");
        $errors['introvid'] = "Invalid value";
    }
    //resume
    syslog(LOG_INFO, "Validating resume");
    if(!is_bool($job_post['resume']))
    {
        syslog(LOG_INFO, "ERROR resume is not a bool");
        $errors['resume'] = "Invalid value";
    }
    //coverletter
    syslog(LOG_INFO, "Validating coverletter");
    if(!is_bool($job_post['coverletter']))
    {
        syslog(LOG_INFO, "ERROR coverletter is not a bool");
        $errors['coverletter'] = "Invalid value";
    }
    //linkedin
    syslog(LOG_INFO, "Validating linkedin");
    if(!is_bool($job_post['linkedin']))
    {
        syslog(LOG_INFO, "ERROR linkedin is not a bool");
        $errors['linkedin'] = "Invalid value";
    }
    //coverletter
    syslog(LOG_INFO, "Validating website");
    if(!is_bool($job_post['website']))
    {
        syslog(LOG_INFO, "ERROR website is not a bool");
        $errors['website'] = "Invalid value";
    }

    //job description -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job description");
    if(!isset($job_post['description']) || strlen($job_post['description']) == 0)
    {
        syslog(LOG_INFO, "ERROR empty job description employer");
        $errors['description'] = "Please enter a job description";
    }
    else if(strlen($job_post['description']) > $MAX_DESCRIPTION_LEN)
    {
        syslog(LOG_INFO, "ERROR job description is too long");
        $errors['description'] = "Job description must be max $MAX_DESCRIPTION_LEN characters.";
    }

    //video q1 -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating video question 1");
    if(!isset($job_post['vq1']))
    {
        syslog(LOG_INFO, "OK - video question 1 is missing");
        $job_post['vq1'] = '';
    }
    else if(strlen($job_post['vq1']) > $MAX_VQ_LEN)
    {
        syslog(LOG_INFO, "ERROR video question 1 is too long");
        $errors['vq1'] = "Video questions must be max $MAX_VQ_LEN characters";
    }

    //video q2 -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating video question 2");
    if(!isset($job_post['vq2']))
    {
        syslog(LOG_INFO, "OK - video question 2 is missing");
        $job_post['vq2'] = '';
    }
    else if(strlen($job_post['vq2']) > $MAX_VQ_LEN)
    {
        syslog(LOG_INFO, "ERROR video question 2 is too long");
        $errors['vq2'] = "Video questions must be max $MAX_VQ_LEN characters";
    }

    //video q3 -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating video question 3");
    if(!isset($job_post['vq3']))
    {
        syslog(LOG_INFO, "OK - video question 3 is missing");
        $job_post['vq3'] = '';
    }
    else if(strlen($job_post['vq3']) > $MAX_VQ_LEN)
    {
        syslog(LOG_INFO, "ERROR video question 3 is too long");
        $errors['vq3'] = "Video questions must be max $MAX_VQ_LEN characters";
    }

    //job post date -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job post date");
    $postdate_formatted = null;
    if(isset($job_post['postdate']))
    {
        $postdate_formatted = postdate_formatted($job_post['postdate']);
    }
    if(is_null($postdate_formatted) || !postdate_isvalid($postdate_formatted))
    {
        syslog(LOG_INFO, "ERROR job post is mising or not greater than or equal to today");
        $todays_date = todays_date();
        $todays_date = $todays_date->format("M j, Y");
        $errors['postdate'] = "Please pick a post date starting from $todays_date";
    }
    else
    {
        $job_post['postdate'] = $postdate_formatted;
    }

    //job post option -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job post option");
    if(!isset($job_post['postoption']))
    {
        syslog(LOG_INFO, "ERROR - missing job post option");
        $errors['postoption'] = "Please pick a post duration";
    }
    else
    {
        $result = $db->joboption_forid($job_post['postoption']);
        if(!$result['ok'])
        {
            finish(false, $config['messages']['TechFail']);
        }
        else if(is_null($result['result']))
        {
            syslog(LOG_INFO, "ERROR - invalid job post option");
            $errors['postoption'] = "Please pick a post duration";
        }
        else if(!isset($errors['postdate']))
        {
            $job_post['expiry'] =  DateTime::createFromFormat('U', strtotime( $job_post['postdate']->format('Y-m-d') . " +" . $result['result']['days'] ." days" ) );
        }
    }

    //job post promo -------------------------------------------------------------------
    syslog(LOG_INFO, "Validating job post promo code");
    if(!isset($job_post['promo']) || strlen($job_post['promo']) == 0)
    {
        syslog(LOG_INFO, "OK - empty /missing promo code");
        $job_post['promo'] = 'NULL';
    }
    else
    {
        $result = $db->postoption_forpromo($job_post['promo']);
        if(!$result['ok'])
        {
            finish(false, $config['messages']['TechFail']);
        }
        else
        {
            $promo_option = $result['result'];
            if(is_null($promo_option))
            {
                syslog(LOG_INFO, "ERROR - invalid promo code");
                $errors['promo'] = "Invalid promo code. Remove or correct before submitting";
            }
            else
            {
                syslog(LOG_INFO, "OK - valid promo code; updating post option");
                $job_post['promo'] = $promo_option;
            }
        }

    }

    //login ---------------- email ------------------------------------------------
    syslog(LOG_INFO, "Validating email");
    if(!isset($job_post['email']) || strlen($job_post['email']) == 0)
    {
        syslog(LOG_INFO, "ERROR - missing email");
        $errors['email'] = 'Please enter your account email';
    }
    else if(!filter_var($job_post['email'], FILTER_VALIDATE_EMAIL))
    {
        syslog(LOG_INFO, "ERROR - not valid email");
        $errors['email'] = 'Please enter a valid email';
    }
    //login ---------------- password ------------------------------------------------
    syslog(LOG_INFO, "Validating password");
    if(!isset($job_post['password']) || strlen($job_post['password']) == 0)
    {
        syslog(LOG_INFO, "ERROR - missing password");
        $errors['password'] = 'Please enter your account password';
    }
    else if(strlen($job_post['password']) < $MIN_PASSWORD_LEN || strlen($job_post['password']) >  $MAX_PASSWORD_LEN)
    {
        syslog(LOG_INFO, "ERROR - password not within required length");
        $errors['password'] = "Password must be $MIN_PASSWORD_LEN to $MAX_PASSWORD_LEN characters";
    }

    //handle login logic if no errors on email + password
    if(!isset($errors['email']) && !isset($errors['password']))
    {
        syslog(LOG_INFO, "Validating account password/email");

        $userid = null;
        $generate_token = false;
        $remove_token = false;
        // check if we are already logged in
        if(isset($_COOKIE["token"]))
        {
            syslog(LOG_INFO, "User token is currently set");
            $result = $db->user_id_bytoken($_COOKIE["token"]);
            if(!$result['ok'])
            {
                finish(false, $config['messages']['TechFail']);
            }
            if(!is_null($result['result']))
            {
                syslog(LOG_INFO, "User token is valid");
                $userid = $result['result']['id'];
            }
            else
            {
                syslog(LOG_INFO, "User token is invalid");
                $ExpireAccount = true;
                $Account = null;
                $remove_token = true;
            }
        }

        syslog(LOG_INFO, "Checking for account with entered email");
        $result = $db->user_byemail($job_post['email']);
        if(!$result['ok'])
        {   
            finish(false, $config['messages']['TechFail']);
        }
        else
        {
            if(is_null($result['result']))
            {
                if(is_null($userid))
                {
                    syslog(LOG_INFO, "No account for that email and we are not logged in - registering user");
                    $saltnhash = reg_saltnhash($job_post['password'], PWD_HASH_LENGTH);
                    $result = $db->user_create('', $saltnhash['result']['salt'], $saltnhash['result']['hash'], $job_post['email']);
                    if(!$result['ok'])
                    {
                        return finish(false, $config['messages']['TechFail']);
                    }

                    $userid = $result['result']['id'];
                    $Account = array('email' => $job_post['email'], 'name' => '');
                    $generate_token = true;
                }
                else
                {
                    syslog(LOG_INFO, "No account for that email and we are logged in - bad email for user");
                    $errors['email'] = "Please enter your logged in account email/password";
                }
            }
            else
            {
                if(!is_null($userid) && $userid != $result['result']['id'])
                {
                    syslog(LOG_INFO, "Account exists for that email and we are logged in with a diff account - bad email for user");
                    $errors['email'] = "Please enter your logged in account email/password";
                }
                else
                {
                    syslog(LOG_INFO, "Account exists for that email and we are logged in  with it - checking password");
                    $hash = reg_hash($job_post['password'], $result['result']['salt'], PWD_HASH_LENGTH);
                    if($hash['result']['hash'] != $result['result']['hash'])
                    {
                        syslog(LOG_INFO, "Invalid password for user account");
                        $errors['password'] = "Invalid password";
                    }
                    else
                    {
                        syslog(LOG_INFO, "Valid password for user account - were are not logged in so set gen token");
                        if(is_null($userid))
                        { 
                            $Account = array('email' => $job_post['email'], 'name' => $result['result']['name']);
                            $generate_token = true;
                        }
                        $userid = $result['result']['id'];
                    }
                }
            }
        }
        if($generate_token)
        {
            syslog(LOG_INFO, "Generating token cookie for either new account or login");

            $token = session_token($userid, PWD_HASH_LENGTH, SESSION_TOKEN_MAXLEN);
            $result = $db->session_create($userid, $token);
            if(!$result['ok'])
            {
                return finish(false, $config['messages']['TechFail']);
            }

            $date_of_expiry = time() + SESSION_TOKEN_LIFE_SECONDS; 
            setcookie( "token", $token, $date_of_expiry, "/");
        }
        else if($remove_token)
        {
            $date_of_expiry = time() - SESSION_TOKEN_LIFE_SECONDS; 
            setcookie( "token", "", $date_of_expiry, "/");   
        }
    }

    if(count($errors) > 0)
    {
        syslog(LOG_INFO, "We have some validation errors so bring these back to user");
        $error_message = "Your submission contained some errors. Please fix these and try again.";
        $result = array('Errors' => $errors, 'ErrorMessage' => $error_message, 'ExpireAccount' => $ExpireAccount, 'Account' => $Account);
        finish(true, $result);
    }

    syslog(LOG_INFO, "No form errors so let's go ahead and create job post");
    $result = $db->jobpost_create($userid, $job_post['address'], $job_post['city'], $job_post['jobfunction'],
        $job_post['jobtype'], $job_post['employer'], $job_post['title'], $job_post['description'],
        $job_post['introvid'], $job_post['resume'], $job_post['coverletter'], $job_post['linkedin'],
        $job_post['website'], $job_post['vq1'], $job_post['vq2'], $job_post['vq3'], $job_post['postdate']->format('Y-m-d'), 
        $job_post['expiry']->format('Y-m-d'), $job_post['postoption'], $job_post['promo']);
    
    if(!$result['ok'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    else if(!$result['result'])
    {
        return finish(false, $config['messages']['TechFail']);
    }
    else
    {
        $JobPostID = $result['result']['id'];
    }

    $result = array('JobPostID' => $JobPostID, 'ExpireAccount' => $ExpireAccount, 'Account' => $Account);
    finish(true, $result);
?>