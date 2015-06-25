<?php
session_start();

require_once('inc.config.php');
require('Client.php');
require('IGrantType.php');
require('AuthorizationCode.php');

/*******************************************************************************
 * IDENTIFICATION
 ******************************************************************************/

$client             =   new OAuth2\Client(CLIENT_ID, CLIENT_SECRET);
$protocol           =   (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$url                =   $protocol.$_SERVER["HTTP_HOST"].$_SERVER['REQUEST_URI'];

//DECONNEXION
if( isset($_GET['reset']) ){
    unset($_SESSION['access_token']);
    header('Content-type: application/json');
    echo json_encode( array( DISCONNECT_PAGE ) );
}

elseif ( !empty($_SESSION['access_token']) ){
    $client -> setAccessToken($_SESSION['access_token']);
    $profile = $client->fetch(PROFILE_PAGE);
}

elseif (empty($_GET['code'])){
  $auth_url = $client->getAuthenticationUrl(AUTHORIZATION_ENDPOINT, $url);
  header('Location: ' . $auth_url);
  die('Redirect');
}

else{
  $params = array('code' => $_GET['code'], 'redirect_uri' => $url);
  $response = $client->getAccessToken(TOKEN_ENDPOINT, 'authorization_code', $params);

  if(isset($response['result']) && isset($response['result']['access_token'])){
    $client->setAccessToken($response['result']['access_token']);
    $_SESSION['access_token'] = $response['result']['access_token'];
    $client->setAccessToken($_SESSION['access_token']);
    $profile = $client->fetch(PROFILE_PAGE);
  }

  else{
    die('Une erreur est survenue lors de l’identification');
  }
}

/*******************************************************************************
 * RETURNS RESULTS
 ******************************************************************************/

if(!empty($profile)){
    $result = json_encode($profile['result']); 
//    echo $result;
?>

<html>
<head>
  <meta charset="utf-8"/>
  <script type="text/javascript" src="../js/jquery.js"></script>
  <script type="text/javascript" src="../js/jquery.cookie.js"></script>
  <script type="text/javascript">
    $(function(){
        $.cookie.json = true;
        $.cookie('cyou-profile', <?php echo $result; ?>, {
          path:'/'
        });

        window.setTimeout(function(){
          if(window.opener.authCallback)
            window.opener.authCallback();
          else
            console.log('Callback not set');
          window.close();
        }, 1000);
    });
  </script>
  <style>
    body{
      background:url(background.jpg) no-repeat center center; 
      text-align:center; 
      font-weight:bold; 
      color:#FFF; 
      margin:0px; 
      padding:0px; 
      height:100%;
    }
  </style>
</head>
<body>
L’authentification a réussi.
</body>
</html>

<?php
}
?>

