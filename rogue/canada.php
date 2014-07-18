<?php

include_once('config.php');
include_once('utility.php');
include_once('roguedb.php');

ini_set('auto_detect_line_endings', true);

$db = new StreamHireDB($config['database']['streamhire']['host'],
$config['database']['streamhire']['user'],
$config['database']['streamhire']['pwd'],
$config['database']['streamhire']['db']);
$result = $db->connect();
if(!$result['ok'])
{
    finish(false, $config['canned_msg']['technical_difficulty']);
}

$handle = fopen("USA.csv", "r");
$count = 0;
$line_count = 0;
$sql = '';
if ($handle) {
    while (($line = fgetcsv($handle)) !== false) {
        $code = $line[0];
        $lat = $line[1];
        $lon = $line[2];
        $sql .= "('$code', $lat, $lon),";
        $line_count++;
        if($line_count == 30) {
            $sql = rtrim($sql, ',');
            $sql = 'insert into location(postalcode, lat, lon) values ' . $sql . ';';
            $result = $db->inject($sql);
            $count++;
            if(!$result['ok']) {
                echo "failed after $count tries";
                exit();
            }
            $sql = '';
            $line_count = 0;
        }
    }

    if($line_count > 0) {
        $sql = rtrim($sql, ',');
        $sql = 'insert into location(postalcode, lat, lon) values ' . $sql . ';';
        $result = $db->inject($sql);
        $count++;
        if(!$result['ok']) {
            echo "failed after $count tries";
            exit();
        }
    }
} else {
    echo "Failed to open";
} 

echo "finished after $count tries";
fclose($handle);
?>