<?php

# Note this line needs to change if you don't use Composer:
# require('connect-php-sdk/autoload.php');
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();


$access_token = ($_ENV["USE_PROD"] == 'true')  ?  $_ENV["PROD_ACCESS_TOKEN"]
                                               :  $_ENV["SANDBOX_ACCESS_TOKEN"];


$host_url = ($_ENV["USE_PROD"] == 'true')  ?  "https://connect.squareup.com"
                                           :  "https://connect.squareupsandbox.com";


$api_config = new \SquareConnect\Configuration();
$api_config->setHost($host_url);


# Initialize the authorization for Square
$api_config->setAccessToken($access_token);
$api_client = new \SquareConnect\ApiClient($api_config);


# Helps ensure this code has been reached via form submission
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  error_log("Received a non-POST request");
  echo "Request not allowed";
  http_response_code(405);
  return;
}



# Retrieve Values From POST REQUEST
$nonce = $_POST['nonce'];
$price = (int)$_POST['price'];



# Fail if the card form didn't send a value for `nonce` to the server
if (is_null($nonce)) {
  echo "Invalid card data";
  http_response_code(422);
  return;
}


$payments_api = new \SquareConnect\Api\PaymentsApi($api_client);
$request_body = array (
  "source_id" => $nonce,
  "amount_money" => array (
    "amount" => $price,
    "currency" => "USD"
  ),
  "idempotency_key" => uniqid()
);

# The SDK throws an exception if a Connect endpoint responds with anything besides
# a 200-level HTTP code. This block catches any exceptions that occur from the request.
try {
  $result = $payments_api->createPayment($request_body);

  /*
  echo "<pre>";
  print_r($result);
  echo "</pre>";
  */

  echo $result;

} catch (\SquareConnect\ApiException $e) {
  /*
  echo "Caught exception!<br/>";
  print_r("<strong>Response body:</strong><br/>");
  echo "<pre>"; var_dump($e->getResponseBody()); echo "</pre>";
  echo "<br/><strong>Response headers:</strong><br/>";
  echo "<pre>"; var_dump($e->getResponseHeaders()); echo "</pre>";
  */
  echo 'error';
}

