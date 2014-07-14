<?php

$keywords = null;
$availability = null;
$location_name = null;
$location_lat = null;
$location_lon = null;

$offset = 0;
$limit = 10;

$availability = array();
$distance = 100;

$location_lat = 0;
$location_lon = 0;

$location_name = 'M9a 4y1';
$locationencoded= urlencode ( $location_name );
$apikey = 'AIzaSyCpxDeqaxRLmAA0XjY8AsIHknz0az_n-aE';
$mapsrequest = "https://maps.googleapis.com/maps/api/geocode/json?key=$apikey&address=$locationencoded";
$result = json_decode(file_get_contents($mapsrequest), true);
var_dump($result);

?>

