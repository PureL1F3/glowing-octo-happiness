<?php

const PWD_HASH_LENGTH = 45;

const SESSION_TOKEN_MAXLEN = 600;
const SESSION_TOKEN_LIFE_SECONDS = 31536000; //60 * 60 * 24 * 365 = 1 year seconds

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