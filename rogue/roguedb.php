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

    function session_create($userid, $token)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:session_create with param: userid=$userid, token=$token"); 
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
        syslog(LOG_INFO, "Calling StreamHireDB:session_kill with param:token=$token"); 
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

    function user_bytoken($token)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_id_bytoken with param:token=$token"); 
        $sql_token = $this->_con->real_escape_string($token);
        $sql = "CALL get_user_via_token('$sql_token');";
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
            syslog(LOG_INFO, 'Got result:'.$object->user_id); 
            $value = array( 'id' => $object->user_id, 
                            'name' => $object->user_name, 
                            'email' => $object->user_email, 
                            'phone' => $object->user_phone, 
                            'salt' => $object->user_salt, 
                            'hash' => $object->user_hash);

            if($object->user_employer == 1)
            {
                $value['employer'] = array( 'name' => $object->employer_name, 'website' => $object->employer_website, 
                                            'description' => $object->employer_description);
            }
            else
            {
                $value['employee'] = array( 'resume' => $object->employee_resume, 'location' => $object->employee_location, 
                                            'lat' => $object->employee_lat, 'lon' => $object->employee_lon, 'distance' => $object->employee_distance);
            }
        }
        return $this->result(true, $value);
    }


    function user_byemail($email)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_byemail with param:email=$email"); 
        $sql_email = $this->_con->real_escape_string($email);
        $sql = "CALL get_user_via_email('$sql_email');";
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
            syslog(LOG_INFO, 'Got result:'.$object->user_id); 
            $value = array( 'id' => $object->user_id, 
                            'name' => $object->user_name, 
                            'email' => $object->user_email, 
                            'phone' => $object->user_phone, 
                            'salt' => $object->user_salt, 
                            'hash' => $object->user_hash);

            if($object->user_employer == 1)
            {
                $value['employer'] = array( 'name' => $object->employer_name, 'website' => $object->employer_website, 
                                            'description' => $object->employer_description);
            }
            else
            {
                $value['employee'] = array( 'resume' => $object->employee_resume, 'location' => $object->employee_location, 
                                            'lat' => $object->employee_lat, 'lon' => $object->employee_lon, 'distance' => $object->employee_distance);
            }
        }
        return $this->result(true, $value);
    }

    function register_employer($employer_name, $employer_description, $employer_url, $account_name, $account_email, $account_phone, $salt, $hash)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:register_employer");
        $sql_employer_name = $this->_con->real_escape_string($employer_name);
        $sql_employer_description = $this->_con->real_escape_string($employer_description);
        $sql_employer_url = $this->_con->real_escape_string($employer_url);
        $sql_account_name = $this->_con->real_escape_string($account_name);
        $sql_account_email = $this->_con->real_escape_string($account_email);
        $sql_account_phone = $this->_con->real_escape_string($account_phone);

        $sql =  "CALL register_employer('$sql_employer_name', '$sql_employer_description', '$sql_employer_url', " .
                "'$sql_account_name', '$sql_account_email', '$sql_account_phone', '$salt', '$hash'); ";
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
            syslog(LOG_INFO, 'Registered employer #:'.$object->id); 
            $value = array('id' => $object->id);
        }
        return $this->result(true, $value);
    }

    function jobfunction_isvalid($job_function)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:jobfunction_isvalid with job_function: $job_function"); 
        $sql = "select name from jobfunction where id=$job_function";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $value = false;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->name); 
            $value = true;
        }
        return $this->result(true, $value);
    }

    function jobtype_isvalid($job_type)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:jobtype_isvalid with job_type: $job_type"); 
        $sql = "select name from jobtype where id=$job_type";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $value = false;
        if($object)
        {
            syslog(LOG_INFO, 'Got result:'.$object->name); 
            $value = true;
        }
        return $this->result(true, $value);
    }


    function jobtypes() {
        syslog(LOG_INFO, "Calling StreamHireDB:jobtypes"); 
        $types = array();
        $sql = "select name, id from jobtype";
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

    function jobfunctions() {
        syslog(LOG_INFO, "Calling StreamHireDB:jobfunctions"); 

        $types = array();
        $sql = "select name, id from jobfunction";
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

    function create_jobpost($userid, $job_location_name, $job_location_lat, 
        $job_location_lon, $job_employer, $job_title, $job_description, 
        $job_function, $job_type, $job_externalurl, $total_hours)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobpost"); 
        $sql_job_location_name = $this->_con->real_escape_string($job_location_name);
        $sql_job_employer = $this->_con->real_escape_string($job_employer);
        $sql_job_title = $this->_con->real_escape_string($job_title);
        $sql_job_description = $this->_con->real_escape_string($job_description);
        $sql_job_externalurl = $this->_con->real_escape_string($job_externalurl);
        $sql = "CALL create_jobpost($userid, '$sql_job_location_name', $job_location_lat, $job_location_lon, '$sql_job_employer', '$sql_job_title', '$sql_job_description', $job_function, $job_type, '$sql_job_externalurl', $total_hours);";
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
            syslog(LOG_INFO, 'Created Job post id #:'.$object->id); 
            $value = array('id' => $object->id);
        }
        return $this->result(true, $value);
    }

    function create_jobpost_availability($jobid, $availability, $AvailabilityDays_count, $AvailabilityCategories_count)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobpost_availability"); 
        $has_availability = false;
        $sql = "insert into jobpost_availability(jobid, day, hour) values ";
        for($i = 0; $i < $AvailabilityDays_count; $i++)
        {
            for($j = 0; $j < $AvailabilityCategories_count; $j++)
            {
                if($availability[$i][$j])
                {
                    $has_availability = true;
                    $sql .= "($jobid, $i, $j),";
                }
            }

        }
        var_dump($availability);
        if(!$has_availability)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
        syslog(LOG_INFO, "SQL: " . $sql); 
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }

    function make_jobpost_golive($jobid)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:make_jobpost_golive"); 
        $sql = "update jobpost set active=true where id=$jobid;";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }
}

?>