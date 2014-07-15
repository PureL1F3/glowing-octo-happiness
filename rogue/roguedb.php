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
                $value['jobseeker'] = array( 'resume' => $object->employee_resume, 'location' => $object->employee_location, 
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
                $value['jobseeker'] = array( 'resume' => $object->employee_resume, 'location' => $object->employee_location, 
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


    function jobtypes($ids_array_only=false) {
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
            if($ids_array_only)
            {
                array_push($types, intval($row['id']));
            }
            else
            {
                array_push($types, array('id' => intval($row['id']), 'name' => $row['name']));
            }
            
        }

        return $this->result(true, $types);
    }

    function jobfunctions($ids_array_only = false) {
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
            if($ids_array_only)
            {
                array_push($types, intval($row['id']));
            }
            else
            {
                array_push($types, array('id' => intval($row['id']), 'name' => $row['name']));
            }
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
        if(!$has_availability)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
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

    function create_jobseeker($account_name, $account_email, $account_phone, 
                $resume, $location_name, $location_lat, 
                $location_lon, $radius, $salt, $hash)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobseeker"); 
        $sql_account_name = $this->_con->real_escape_string($account_name);
        $sql_account_email = $this->_con->real_escape_string($account_email);
        $sql_account_phone = $this->_con->real_escape_string($account_phone);
        $sql_resume = $this->_con->real_escape_string($resume);
        $sql_location_name = $this->_con->real_escape_string($location_name);
        $sql = "CALL register_jobseeker('$sql_account_name', '$sql_account_email', '$sql_account_phone', '$sql_resume', '$sql_location_name', $location_lat, $location_lon, $radius, '$salt', '$hash');";
        syslog(LOG_INFO, "$sql"); 
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
            syslog(LOG_INFO, 'Created job seeker id #:'.$object->id); 
            $value = array('id' => $object->id);
        }
        return $this->result(true, $value);
    }

    function create_jobseeker_jobtypes($userid, $jobtypes)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobseeker_jobtypes"); 
        $has_jobtypes = false;
        $sql = "insert into jobseeker_jobtypes(jobseekerid, jobtypeid) values ";
        foreach($jobtypes as $f)
        {
            $sql .= "($userid, $f),";
            $has_jobtypes = true;
        }
        if(!$has_jobtypes)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }

    function create_jobseeker_jobfunctions($userid, $jobfunctions)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobseeker_jobfunctions"); 
        $has_jobfunctions = false;
        $sql = "insert into jobseeker_jobfunctions(jobseekerid, jobfunctionid) values ";
        foreach($jobfunctions as $f)
        {
            $sql .= "($userid, $f),";
            $has_jobfunctions = true;
        }
        if(!$has_jobfunctions)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }

    function create_jobseeker_availability($userid, $availability, $AvailabilityDays_count, $AvailabilityCategories_count)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobseeker_availability"); 
        $has_availability = false;
        $sql = "insert into jobseeker_availability(jobseekerid, day, hour) values ";
        for($i = 0; $i < $AvailabilityDays_count; $i++)
        {
            for($j = 0; $j < $AvailabilityCategories_count; $j++)
            {
                if($availability[$i][$j])
                {
                    $has_availability = true;
                    $sql .= "($userid, $i, $j),";
                }
            }

        }
        if(!$has_availability)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }

    function user_availability($userid, $availability)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_availability for userid $userid"); 
        $sql = "select day, hour from jobseeker_availability where jobseekerid=$userid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            $day = intval($row['day']);
            $hour = intval($row['hour']);

            $availability[$day][$hour] = true;
        }

        return $this->result(true, $availability);
    }

    function user_jobtypes($userid)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:user_jobtypes for userid $userid"); 
        $jobtypes = array();
        $sql = "select jobtypeid from jobseeker_jobtypes where jobseekerid=$userid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($jobtypes, intval($row['jobtypeid']));
        }

        return $this->result(true, $jobtypes);
    }

    function user_jobfunctions($userid)
    {
        $jobfunctions = array();
        $sql = "select jobfunctionid from jobseeker_jobfunctions where jobseekerid=$userid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($jobfunctions, intval($row['jobfunctionid']));
        }

        return $this->result(true, $jobfunctions);
    }

    function get_search_keywords($keywords)
    {
        $keyword_clause = "";
        //remove non alphanumeric and replace multi white space with single space
        $keywords = trim($keywords);
        $keywords = preg_replace('/[^a-z \d ]/i', '', $keywords);
        $keywords = preg_replace('/\s+/', ' ',$keywords);
        return $keywords;
    }

    function get_jobsearch_sql($keywords, $availability, $location_lat, 
            $location_lon, $offset, $distance, $limit)
    {
        $lon1 = $location_lon - $distance / abs(cos(deg2rad($location_lat)) * 69);
        $lon2 = $location_lon + $distance / abs(cos(deg2rad($location_lat)) * 69);
        $lat1 = $location_lat - ($distance / 69);
        $lat2 = $location_lat + ($distance / 69);

        $availability_clause = "";
        for($i = 0; $i < count($availability); $i++)
        {
            $availability_clause_day = "";
            for($j = 0; $j < count($availability[$i]); $j++)
            {
                if($availability[$i][$j])
                {
                    if(strlen($availability_clause_day) == 0)
                    {
                        $availability_clause_day .= "(day=$i and hour in (";
                    }

                    $availability_clause_day .= "$j,";
                }
            }
            if(strlen($availability_clause_day) > 0)
            {
                $availability_clause_day = rtrim($availability_clause_day, ",");
                $availability_clause_day .= "),";
                $availability_clause .= $availability_clause_day;
                if($i + 1 == count($availability))
                {

                    $availability_clause = rtrim($availability_clause, ",");
                    $availability_clause = "(select jobid, count(hour) match_hours " .
                                            "from jobpost_availability where " . $availability_clause . 
                                            ") ja on j.id=ja.jobid ";
                }
            }
        }

        $keyword_clause = "";
        //remove non alphanumeric and replace multi white space with single space
        $keywords = get_search_keywords($keywords);
        $sql_keywords = $this->_con->real_escape_string($keywords);

        $keywords_array = explode ( $keywords ,' ');
        foreach($keywords_array as $k)
        {
            $keyword_clause .= "$k* ";
        }
        if(strlen($keyword_clause) > 0) 
        {
            rtrim($keyword_clause, ' ');

            $keyword_clause = "match(j.title, j.description) against ('$keyword_clause' IN BOOLEAN MODE) ";
        }

        $detination_clause = "j.lon between $lon1 and $lon2 and j.lat between $lat1 and $lat2 ";

        $sql = "select j.id, j.title, j.description, e.name, j.created, j.total_hours, ";
        if(strlen($availability_clause))
        {
            $sql .= " ja.match_hours, ";
        }
        else
        {
            $sql .= " 0 match_hours, ";
        }

        $sql .= "3956 * 2 * ASIN(SQRT( POWER(SIN(($location_lat - j.lat) *  pi()/180 / 2), 2) " .
            "+ COS($location_lat * pi()/180) " .
            "* COS(j.lat * pi()/180) " .
            "* POWER(SIN(($location_lon - j.lon) " .
            "* pi()/180 / 2), 2) )) " .
        "as distance " .
        "from jobpost j " .
        "join employer e on j.employerid=e.userid ";

        if(strlen($availability_clause))
        {
            $sql .= " join " . $availability_clause;    
        }
        "where " . $detination_clause;
        if(strlen($keyword_clause))
        {
            $sql .= " and " . $keyword_clause;
        }

        $sql .= "order by match_hours limit $offset, $limit;";

        return $sql;
    }

    function jobs($keywords, $availability, $location_lat, 
            $location_lon, $offset, $distance, $limit)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:jobs"); 
        $jobs = array();
        $sql = get_jobsearch_sql($keywords, $availability, $location_lat, 
                    $location_lon, $offset, $distance, $limit);
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            $job = array(   'id' => intval($row['id']),
                            'title' => $row['title'],
                            'employer' => $row['name'],
                            'created' => $row['created'],
                            'total_hours' => intval($row['total_hours']),
                            'match_hours' => intval($row['match_hours']),
                            'distance' => floatval($row['distance']));
            array_push($jobs, $job);
        }

        return $this->result(true, $jobs);
    }

    function get_totalcount()
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_totalcount"); 
        $rows = 0;
        $sql = "SELECT FOUND_ROWS() rows;";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        if($row = $result->fetch_array())
        {
            $rows = $object['rows'];
        }

        return $this->result(true, $rows);
    }

    function create_jobapplicant()
    {   
        syslog(LOG_INFO, "Calling StreamHireDB:create_jobapplicant"); 
        $sql_name = $this->_con->real_escape_string($name);
        $sql_email = $this->_con->real_escape_string($email);
        $sql_phone = $this->_con->real_escape_string($phone);
        $sql_resume = $this->_con->real_escape_string($resume);
        $sql = "CALL create_applicant($sql_name, $sql_email, $sql_phone, $sql_resume);";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($row = $result->fetch_array())
        {
            array_push($jobtypes, intval($row['jobtypeid']));
        }

        return $this->result(true, $jobtypes);
    }

    function get_tempapplicantid($token)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_tempapplicant");
        $sql_token = $this->_con->real_escape_string($token); 
        $sql = "select id from tempapplicants where token='$sql_token';";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();
        $applicantid = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Found temp applicant id #:'.$object->id); 
            $applicantid = array('id' => $object->id);
        }

        return $this->result(true, $applicantid);
    }

    function create_tempapplicant($token)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:create_tempapplicant"); 
        $sql = "CALL create_tempapplicant($token);";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();
        $applicantid = NULL;
        if($object)
        {
            syslog(LOG_INFO, 'Created temp applicant id #:'.$object->id); 
            $applicantid = array('id' => $object->id);
        }

        return $this->result(true, $applicantid);
    }

    function submit_jobapplication($jobid, $userid, $name, $email, $phone, $resume)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:submit_jobapplication"); 
        $sql_name = $this->_con->real_escape_string($name);
        $sql_email = $this->_con->real_escape_string($email);
        $sql_phone = $this->_con->real_escape_string($phone);
        $sql_resume = $this->_con->real_escape_string($resume);
        $sql = "CALL create_application($jobid, $userid, '$sql_name', '$sql_email', '$sql_phone', '$sql_resume');";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $application = null;
        $object = $result->fetch_object();
        $this->mysql_clean_buffer();
        if($object)
        {
            $application = array('id' => $object->id);
        }

        return $this->result(true, $application);
    }

    function submit_jobapplicationavailability($applicationid, $availability, $AvailabilityDays_count, $AvailabilityCategories_count)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:submit_jobapplicationavailability"); 
        $has_availability = false;
        $sql = "insert into application_availability(applicationid, day, hour) values ";
        for($i = 0; $i < $AvailabilityDays_count; $i++)
        {
            for($j = 0; $j < $AvailabilityCategories_count; $j++)
            {
                if($availability[$i][$j])
                {
                    $has_availability = true;
                    $sql .= "($applicationid, $i, $j),";
                }
            }

        }
        if(!$has_availability)
        {
            return;
        }

        $sql = rtrim($sql, ",");
        $sql .= ";";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        return $this->result(true);
    }

    function get_employer_jobposts($userid, $page, $results)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_employer_jobposts");
        $jobs = array();

        $offset = ($page - 1) * $results;
        $sql = "select j.id, j.title, e.name, DATEDIFF(NOW(), j.created), DATEDIFF(j.expires, NOW()), " .
        "(select count(applicationid) from applications where jobid = 16 and isyes is null) new_candidates, " . 
        "(select count(applicationid) from applications where jobid = 16 and isyes = 1) yes_candidates, " .
        "(select count(applicationid) from applications where jobid = 16 and isyes = 0) no_candidates, " .
        "0 match_candidates, total_hours " .
        "from jobpost j " .
        "join employer e on j.employerid=e.userid " .
        "join applications a on a.jobid = j.id " .
        "where j.employerid=$userid " .
        "limit $offset, $results; ";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($object = $result->fetch_object())
        {
            $job = array('id' => $object->id, 'title' => $object->title, 
                'employer' => $object->employer, 'posted_days' => $object->posted_days,
                'expire_days' => $object->expire_days, 
                'candidates' => array(
                    'new' => $object->new_candidates,
                    'yes' => $object->yes_candidates,
                    'no' => $object->no_candidates,
                    'matches' => $object->match_candidates),
                'job_hours' => $object->total_hours
                );
            array_push($jobs, $job);
        }

        return $this->result(true, $jobs);
    }

    function get_employer_jobpost($userid, $jobid)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_employer_jobpost");
        $job = null;

        $sql = "select j.id, j.title, e.name employer, DATEDIFF(NOW(), j.created) posted_days, DATEDIFF(j.expires, NOW()) expire_days, " .
        "(select count(applicationid) from applications where jobid = 16 and isyes is null) new_candidates, " . 
        "(select count(applicationid) from applications where jobid = 16 and isyes = 1) yes_candidates, " .
        "(select count(applicationid) from applications where jobid = 16 and isyes = 0) no_candidates, " .
        "0 match_candidates, total_hours " .
        "from jobpost j " .
        "join employer e on j.employerid=e.userid " .
        "join applications a on a.jobid = j.id " .
        "where j.id=$jobid and j.employerid=$userid;";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        $object = $result->fetch_object();
        if($object)
        {
            
            $job = array('id' => $object->id, 'title' => $object->title, 
                'employer' => $object->employer, 'posted_days' => $object->posted_days,
                'expire_days' => $object->expire_days, 
                'candidates' => array(
                    'new' => $object->new_candidates,
                    'yes' => $object->yes_candidates,
                    'no' => $object->no_candidates,
                    'matches' => $object->match_candidates),
                'job_hours' => $object->total_hours
                );
        }
        return $this->result(true, $job);
    }

    function get_employer_jobpost_candidates($userid, $jobid, $candidate_type, $page, $results)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_employer_jobpost_candidates");
        $candidates = array();
        $offset = ($page - 1) * $results;
        $sql = "select j.applicationid, j.applicantid, j.name, j.email, j.phone, j.resume, " .
        "datediff(now(), j.created) application_days from applications j where j.jobid=$jobid and ";

        if($candidate_type == 'New')
        {
            $sql .= " j.isyes is null ";

        }
        else if($candidate_type == 'Yes')
        {
            $sql .= " j.isyes=1 ";
        }
        else if($candidate_type == 'No')
        {
            $sql .= " j.isyes=0 ";
        }

        $sql .=" limit $offset, $results;";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($object = $result->fetch_object())
        {
            $candidate = array('id' => intval($object->applicationid), 'applicantid' => intval($object->applicantid), 
                'name' => $object->name, 'email' => $object->email, 'phone' => $object->phone,
                'resume' => $object->resume, 'application_days' => intval($object->application_days), 'job_hours_match' => 0);
            $candidates[$candidate['id']] = $candidate;
        }
        return $this->result(true, $candidates);
    }

    function get_candidates_availability($userid, $jobid, $candidates, $job)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_candidates_availability");
        $sql = "select applicationid, day, hour from application_availability where applicationid in (";
        foreach($candidates as $c_id => $c)
        {
            $sql .= "$c_id,";
        }
        $sql = rtrim($sql, ',');
        $sql .= ");";

        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($object = $result->fetch_object())
        {
            $id = intval($object->applicationid);
            $day = intval($object->day);
            $hour = intval($object->hour);
            $candidates[$id]['availability'][$day][$hour] = true;
            if($job['availability'][$day][$hour])
            {
                $candidates[$id]['job_hours_match'] += 1;
            }
        }
        return $this->result(true, $candidates);
    }

    function get_jobpost_availability($jobid, $job)
    {
        syslog(LOG_INFO, "Calling StreamHireDB:get_jobpost_availability");
        $sql = "select day, hour from jobpost_availability where jobid=$jobid";
        $result = $this->_con->query($sql);
        if(!$result)
        {
            return $this->mysql_error();
        }
        while($object = $result->fetch_object())
        {
            $day = intval($object->day);
            $hour = intval($object->hour);
            $job['availability'][$day][$hour] = true;
        }
        return $this->result(true, $job);

    }

}

?>