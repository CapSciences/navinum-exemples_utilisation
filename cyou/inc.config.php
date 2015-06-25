<?php

/*******************************************************************************
 * Authentification
 ******************************************************************************/


const CLIENT_ID              = 'YOUR_CLIENT_ID';
const CLIENT_SECRET          = 'YOUR_CLIENT_SECRET';
const AUTHORIZATION_ENDPOINT = 'http://YOUR_SERVER_SSO/oauth/v2/auth';
const TOKEN_ENDPOINT         = 'http://YOUR_SERVER_SSO/oauth/v2/token';
const PROFILE_PAGE           = 'http://YOUR_SERVER_SSO/sso/whoami';
const DISCONNECT_PAGE        = 'http://YOUR_SERVER_SSO/user/security/logout';

/*******************************************************************************
 * CYOU API
 ******************************************************************************/
const CYOU_API_PREPROD  =   'http://YOUR_SERVER_API_PREPROD/api.php/';
const CYOU_API          =   'http://YOUR_SERVER_API/api.php/';
const CYOU_API_TEST     =   'http://YOUR_SERVER_API_TEST/api_test.php/';

/*******************************************************************************
 * CYOU API FUNCTIONS
 ******************************************************************************/

function arrayToGET($array){
  $ret = NULL;
  foreach($array as $key => $val)
    $ret .= ($ret ? "&" : "?") . urlencode($key) . "=" . urlencode($val);
  return $ret;
}

function request($url, $getdata = NULL, $postdata = NULL){
  $curl = curl_init();
  $url = $getdata ? CYOU_API.$url.arrayToGET($getdata) : $_api_url.$url;

  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  if($postdata){
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($postdata));
  }
  $output = curl_exec($curl);

  if(curl_errno($curl))
    echo "ERREUR curl_exec : ".curl_error($curl)."\n";

  curl_close($curl);
  return json_decode($output);
}

function  get($url, $data){ 
    return request($url, $data, NULL); 
}
function post($url, $data){
    return request($url, NULL, $data); 
}

?>
