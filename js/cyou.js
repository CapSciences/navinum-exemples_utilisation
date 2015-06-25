var authCallback = null;
var authWindow;

(function($) {
    $.cookie.json = true;

    $.cyouAuth                                                                  =   function( callback ){
        $.removeCookie('cyou-profile', { path: '/' });
        if ( authWindow )
            authWindow.close();
        authWindow  =   window.open('cyou/auth.php', 'loginWindow', 'height=628, width=1000');
        if( !authWindow )
            console.log("Could not open the auth window");
        else if( callback ){
            authCallback    =   function(){
                if( !$.cyouProfile() )
                    console.log("Error, not connected");
                if(callback) 
                    callback();
            }
        }
    }
  
  $.cyouDeAuth                                                                  =  function( callback ){
        $.removeCookie('cyou-profile', { path: '/' });
        if( callback ) 
            callback();
  } 

  $.cyouDisconnect                                                              =  function( callback ){
    $.ajax('cyou/auth.php?reset')
        .success(function(data, textStatus, jqXHR){
            $.removeCookie('cyou-profile', { path: '/' });
            var logoutWindow = window.open(data[0], 'logoutWindow', 'height=628, width=1200');
            setTimeout(function(){
                logoutWindow.close();
                location.reload();
            }, 1000);
        })
        .fail(function(){
            console.log("Could no get the disconnection URL");
        }).complete(callback);
  }

  $.cyouProfile = function(){
        return $.cookie('cyou-profile');
  }

}(jQuery));

