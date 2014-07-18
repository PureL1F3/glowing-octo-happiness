<?php

//job periods
$TOTAL_DAYS = array();
$TOTAL_PERIODS = array();
const TOTAL_DAYS_COUNT = 7;
const TOTAL_PERIODS_COUNT = 6;

// input validation
const MIN_PASSWORD_LEN = 6;
const MAX_PASSWORD_LEN = 12;


const MAX_LOCATION_LEN = 10;

//result response codes
const BAD_REQUEST = "BAD_REQUEST";
const TECH_ISSUE = "TECH_ISSUE";
const NEED_LOGIN = "NEED_LOGIN";
const GOTO_JOBSEEKER_LOGIN = "GOTO_JOBSEEKER_LOGIN";
const GOTO_EMPLOYER_LOGIN = "GOTO_EMPLOYER_LOGIN";


const NOT_AUTH = "NOT_AUTH";

//employer extend job post
const INVALID_EXTENDPOST_EXPIRED = "INVALID_EXTENDPOST_EXPIRED";
const INVALID_EXTENDPOST_TOOEARLY = "INVALID_EXTENDPOST_TOOEARLY";

//password / session setups
const PWD_HASH_LENGTH = 45;
const SESSION_TOKEN_MAXLEN = 600;
const SESSION_TOKEN_LIFE_SECONDS = 31536000; //60 * 60 * 24 * 365 = 1 year seconds

// is this used?
const BASE_SUBDOMAIN = "107.170.154.102";


$config = array();

$config['database'] = array();
$config['database']['streamhire'] = array('host' => '107.170.154.102', 
                                       'user' => 'root', 
                                       'pwd' => '65UB3b3$',
                                       'db' => 'rogue');


$config['canned_msg'] = array();
$config['canned_msg']['technical_difficulty'] = 'Sorry we are experiencing some technical difficulties. Please try again later';

?>