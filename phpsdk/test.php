<?php

require './vendor/autoload.php';
use Aws\Sqs\SqsClient;

$requestid = '1';
$requesturl = 'https://www.youtube.com/watch?v=9hUPdkxsOV8';

// --- add reques to extractor queue ---
$sqsSettings = array(
  'key' => 'AKIAIGJGPO4Q5NWPX5OA', 
  'secret' => '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', 
  'region' => 'us-east-1');
$client = SqsClient::factory($sqsSettings);
$result = $client->createQueue(array('QueueName' => 'extractor'));
$queueUrl = $result->get('QueueUrl');
$msgBody = array (
  'id' => $requestid,
  'url' => $requesturl);
$msgBody = json_encode($msgBody);
$msg = array(
  'QueueUrl' => $queueUrl,
  'MessageBody' => $msgBody);
$client->sendMessage($msg);

// --- return requestid to the user ---

?>
