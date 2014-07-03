<?php

class StreamHireDB 
{
    private $_host = NULL;
    private $_user = NULL;
    private $_pwd = NULL;
    private $_db = NULL;
    private $_con = NULL;
    
    function __construct($host, $user, $pwd, $db)
    {
        syslog(LOG_INFO, 'Constructing StreamHireDB');
        $this->_host = $host;
        $this->_user = $user;
        $this->_pwd = $pwd;
        $this->_db = $db;
    }

    # ------------------ connection ------------------
    function connect()
    {
        syslog(LOG_INFO, 'Connecting StreamHireDB');
        $this->_con = mysqli_connect($this->_host, $this->_user, $this->_pwd, $this->_db);
        if(mysqli_connect_errno())
        {
            return $this->mysql_connect_error();
        }
        return $this->result(true);
    }

    # ------------------ utilities ------------------
    function mysql_clean_buffer()
    {
        syslog(LOG_INFO, 'Calling StreamHireDB:mysql_clean_buffer'); 
        while ($this->_con->more_results())
        {
            $this->_con->next_result();
            $result = $this->_con->store_result();
            if ($result instanceof mysqli_result) 
            {
                $result->free();
            }
        }
    }

    # ------------------ error ------------------
    function mysql_connect_error()
    {
        syslog(LOG_ERR, 'StreamHireDB SQL Connection Error: ' . mysqli_connect_error());
        return $this->result(false);
    }

    function mysql_error()
    {
        syslog(LOG_ERR, 'StreamHireDB SQL Error: ' . mysqli_error($this->_con));
        return $this->result(false);
    }

    # ------------------ result ------------------
    function result($ok, $value=NULL)
    {
        syslog(LOG_INFO, 'Calling StreamHireDB:result'); 
        $result = array('ok' => $ok, 'result' => $value);
        return $result;
    }

    # ------------------ functionalities ------------------
    function session_create($userid, $token)
    {
        syslog(LOG_INFO, "Calling VidblitDb:session_create with param: userid=$userid, token=$token"); 
        $sql_userid = $this->_con->real_escape_string($userid);
        $sql_token = $this->_con->real_escape_string($token);
        $sql = "CALL create_session('$sql_userid', '$sql_token');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $this->mysql_clean_buffer();
        return $this->result(true);
    }

    function session_kill($token)
    {
        syslog(LOG_INFO, "Calling VidblitDb:session_kill with param:token=$token"); 
        $sql_token = $this->_con->real_escape_string($token);
        $sql = "CALL kill_session('$sql_token');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $this->mysql_clean_buffer();
        return $this->result(true);
    }

    function user_create($user, $salt, $hash, $email)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_create with param: user=$user, salt=$salt, hash=$hash, email=$email"); 
        $sql_user = $this->_con->real_escape_string($user);
        $sql_salt = $this->_con->real_escape_string($salt);
        $sql_hash = $this->_con->real_escape_string($hash);
        $sql_email = $this->_con->real_escape_string($email);
        $sql = "CALL create_user('$sql_user', '$sql_salt', '$sql_hash', '$sql_email');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();
        $value = array('id' => $object->userid);
        return $this->result(true, $value);
    }

    function user_id_bytoken($token)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_id_bytoken with param:token=$token"); 
        $sql_token = $this->_con->real_escape_string($token);
        $sql = "CALL get_session_userid('$sql_token');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();

        $value = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->userid); 
            $value = array('id' => $object->userid);
        }
        return $this->result(true, $value);
    }

    function user_id_byemail($email)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_id_byemail with param: email=$email"); 
        $sql_email = $this->_con->real_escape_string($email);
        $sql = "select id from user where email='$sql_email';";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $value = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->id); 
            $value = array('id' => $object->id);
        }
        return $this->result(true, $value);
    }

    function joboption_id_forpromo($country, $promo) {
        syslog(LOG_INFO, "Calling StreamHireDB:joboption_id_forpromo with param: country=$country, promo=$promo");
        $sql_promo = '';
        $sql_email = $this->_con->real_escape_string($email);
        $sql = "select id from JobOption where promo='$sql_promo' and active=1;";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $value = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->id); 
            $value = array('id' => $object->id);
        }
        return $this->result(true, $value);
    }

    function jobpost_create($userid, $postaddr, $postcity, $postfunction,
                        $posttype, $postemployer, $posttitle, $postdescription,
                        $postintrovid, $postresume, $postcoverletter, $postlinkedin,
                        $postwebsite, $postvq1, $postvq2, $postvq3, $postoption)
    {
        $sql_addr = $this->_con->real_escape_string($postaddr);
        $sql_employer = $this->_con->real_escape_string($postemployer);
        $sql_title = $this->_con->real_escape_string($posttitle);
        $sql_description = $this->_con->real_escape_string($postdescription);
        $sql_vq1 = $this->_con->real_escape_string($postvq1);
        $sql_vq2 = $this->_con->real_escape_string($postvq2);
        $sql_vq3 = $this->_con->real_escape_string($postvq3);

        $sql = "CALL create_jobpost($userid, '$sql_addr', $postcity, $postfunction, $posttype, '$sql_employer', '$sql_title', '$sql_description', $postintrovid, $postresume, $postcoverletter, $postlinkedin, $postwebsite, '$sql_vq1', '$sql_vq2', '$sql_vq3');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();

        $value = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->userid); 
            $value = array('id' => $object->userid);
        }
        return $this->result(true, $value);
    }

    function cities_forcountry($country) {
        $cities = array();
        $sql_countryid = $this->_con->real_escape_string($country);
        $sql = "select name, id from City where countryid=$sql_countryid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($cities, array('id' => intval($row['id']), 'name' => $row['name']));
        }

        return $this->result(true, $cities);
    }

    function functions_forcountry($country) {
        $functions = array();
        $sql_countryid = $this->_con->real_escape_string($country);
        $sql = "select name, id from Function where countryid=$sql_countryid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($functions, array('id' => intval($row['id']), 'name' => $row['name']));
        }

        return $this->result(true, $functions);
    }

    function types_forcountry($country) {
        $types = array();
        $sql_countryid = $this->_con->real_escape_string($country);
        $sql = "select name, id from Type where countryid=$sql_countryid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($types, array('id' => intval($row['id']), 'name' => $row['name']));
        }

        return $this->result(true, $types);
    }

    function joboptions_forcountry($country) {
        $options = array();
        $sql_countryid = $this->_con->real_escape_string($country);
        $sql = "select name, id, duration from JobOption where countryid=$sql_countryid and active=1 and promo is NULL";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($options, array('id' => intval($row['id']), 'name' => $row['name'], 'days' => $row['duration']));
        }

        return $this->result(true, $options);
    }
}


?>