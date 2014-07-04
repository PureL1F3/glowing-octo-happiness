<?php
const REGISTRATION_NAME_MINCHAR = 1;
const REGISTRATION_NAME_MAXCHAR = 100;

const REGISTRATION_PWD_MINCHAR = 6;
const REGISTRATION_PWD_MAXCHAR = 12;

const PWD_HASH_LENGTH = 45;

const SESSION_TOKEN_MAXLEN = 600;
const SESSION_TOKEN_LIFE_SECONDS = 31536000; //60 * 60 * 24 * 365 = 1 year seconds

const BASE_SUBDOMAIN = "107.170.154.102";

const JOBPOST_ADDR_MAXCHAR = 100;

const JOBPOST_EMPLOYER_MINCHAR = 1;
const JOBPOST_EMPLOYER_MAXCHAR = 200;

const JOBPOST_TITLE_MINCHAR = 1;
const JOBPOST_TITLE_MAXCHAR = 200;

const JOBPOST_DESCRIPTION_MINCHAR = 1;
const JOBPOST_DESCRIPTION_MAXCHAR = 5000;

const JOBPOST_VQ_MAXCHAR = 500;

const JOBPOST_PROMO_MAXCHAR = 45;

$config = array();

$config['database'] = array();
$config['database']['streamhire'] = array('host' => '107.170.154.102', 
                                       'user' => 'root', 
                                       'pwd' => '65UB3b3$',
                                       'db' => 'streamhire');

$config['rabbit'] = array();
$config['rabbit']['connection'] = array('host' => '107.170.154.102',
                                        'port' => 5672,
                                        'user' => 'guest',
                                        'pwd' => 'guest');

$config['rabbit']['q'] = array('http_proxy' => 'http_proxy',
                               'https_proxy'=> 'https_proxy',
                               'extractor' => 'extractor',
                               'downloadtranscoder' => 'dowloadtranscoder');

$config['cloudfront']['vidblit'] = array('keypairid' => 'APKAJ4OLBHAH22L5KMLQ',
                             'keypempath' => '/pk.pem');
$config['cloudfront']['basepath'] = array('extract' => 'http://d3oqotq78cv8kq.cloudfront.net/extracts/%s');

$config['messages'] = array('TechFail' => 'Technical Difficulties',
                            'BadRequest' => 'Bad request',
                            'NotLoggedIn' => 'You need to be logged in to do this. Please login.',
                            //registration
                            'BadRegUser' => 'Name must be max '.REGISTRATION_NAME_MAXCHAR.' characters',
                            'BadRegPwd' => 'Password must be '.REGISTRATION_PWD_MINCHAR.' to '.REGISTRATION_PWD_MAXCHAR.' characters',
                            'BadRegEmail' => 'Email is invalid',
                            'BadRegDuplicateEmailOrBadPassword' => 'That e-mail already exists. Your password is incorrect.',

                            'BadJobPostAddr' => 'Name must be max ' . JOBPOST_ADDR_MAXCHAR . ' characters',
                            'BadJobPostCountry' => 'Missing/Invalid required Country',
                            'BadJobPostCity' => 'Missing/Invalid required City',
                            'BadJobPostFunction' => 'Missing/Invalid required Function',
                            'BadJobPostType' => 'Missing/Invalid required Type',
                            'BadJobPostEmployer' => 'Employer name must be '.JOBPOST_EMPLOYER_MINCHAR.' to '.JOBPOST_EMPLOYER_MAXCHAR.' characters',
                            'BadJobPostTitle' => 'Employer name must be '.JOBPOST_TITLE_MINCHAR.' to '.JOBPOST_TITLE_MAXCHAR.' characters',
                            'BadJobPostDescription' => 'Employer name must be '.JOBPOST_DESCRIPTION_MINCHAR.' to '.JOBPOST_DESCRIPTION_MAXCHAR.' characters',
                            'BadJobPostIntroVid' => 'Missing/Invalid required Intro Video option',
                            'BadJobPostResume' => 'Missing/Invalid required Resume option',
                            'BadJobPostCoverLetter' => 'Missing/Invalid required Cover Letter option',
                            'BadJobPostLinkedin' => 'Missing/Invalid required LinkedIn option',
                            'BadJobPostWebsite' => 'Missing/Invalid required Website option',
                            'BadJobPostOption' => 'Missing/Invalid required Post Duration option',
                            'BadJobPostPromo' => 'Invalid required Post Promo Code option'

                            );




?>