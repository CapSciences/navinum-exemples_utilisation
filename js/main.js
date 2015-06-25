var phpBridgeUrl        =   "http://YOUR_SERVER_ADRESS/index.php/default/phpBridgeApi";
var weburl              =   "http://YOUR_SERVER_ADRESS/";
var ws_authentification =   "YOUR_LOGIN:YOUR_PASS";

// SESSION BEGIN
var start_date          =   $.now();   

var visiteur_id;
var interactif_id       =   "YOUR_INTERACTIF_ID";   
var typologie_id        =   "YOUR_TYPOLOGIE_ID";    

var csapi;

$(function(){
    addButtonListener();
});        
    

function        addConnectedInfo                                                () {
    //****************************************************************************//
    //******************        AUTHENTIFICATION        **************************//
    //****************************************************************************//
    var profile = $.cyouProfile();
    if( profile ){
        setTimeout( function(){
            //******************        AUTHENTIFICATION OK      ********************//
            //BUTTON MANAGEMENT
            $('.id-button.unauthentified')
                .removeClass('unauthentified')
                .removeClass('red')
                .addClass('teal')
                .html('Authentifié (' + profile.pseudo_son + ')');
            $('.disconnect').show();
            $('.cookie').show();


            //EXEMPLE DES INFORMATION CONTENU DANS LE PROFIL 
            $('#contentProfil').show();
            $('#pseudo').html( profile.pseudo_son  );
            $('#mail').html( profile.email  );
            $('#avatar').attr( 'src', profile.url_avatar  );
            $('#score').html( "not settable using this method" );
            $('#divers').html( profile.ville );

            visiteur_id =   profile.guid;
            $('#guid').html( visiteur_id );

        //****************************************************************************//
        //******************     RECUPERATION DES INFOS VIA CSAPI    *****************//
        //****************************************************************************//

            // INSTANCIATION CSAPI
            csapi   = new CsApi(
                        //PARAMETERS
                        {
                            "phpBridgeUrl":         phpBridgeUrl,
                            "weburl":               weburl,
                            "ws_authentification":  ws_authentification,
                            "interactif_id" :       interactif_id,
                            "visiteur_id":          visiteur_id,
                            "connection" :          "web"
                        },
                        //TYPE CONNECTION
                    'web');

            csapi.getVisiteur(); // TODO A SUPPRIMER APRES LA CORRECTION DU CSAPI
            
            $('#contentProfil2').show();
            
            $('#pseudo2').html( csapi.getPseudo()  );
            $('#mail2').html( csapi.getEmail()  );
            $('#avatar2').attr( 'src', csapi.getPhotoVisiteur()  );
            $('#score2').html( csapi.getScoreVisiteurInteractif()  );
            $('#scoreTypo2').html( csapi.getXp()[1].score  );

            $('#divers2').html( csapi.getVisiteurProfile().ville );

            // LIGNE A RAJOUTER SI INTERACTIF NON INSTANCIE AUPARAVANT //            
    //                csapi.getInteractif( interactif_id ); 
            $('.interactifName').html( csapi.getInteractifVariable().libelle );

            $('#nbLogVisite').html(  csapi.getLogVisites().length );
            $('#lastLogVisiteScoreMethod1').html(  csapi.getLogVisiteHighScore  ( 
                                                                                    {
                                                                                     "interactif_id" : interactif_id,
                                                                                     "visiteur_id":    visiteur_id
                                                                                    } 
                                                                                ) );
            $('#lastLogVisiteScoreMethod2').html(  csapi.getLogVisiteHighScoreV2( 
                    {
                        "visiteur_id":          visiteur_id,
                        "interactif_id":        interactif_id,
                        "limit":                1  //mettre plus pour avoir un tableau de score.
                    }
                ).logVisite[0].highScore   // 0 est le rang... a changer si limit > 1
            );

            $('#test2').html(  "" );
        }, 1200 );
    } else{  
    //******************        AUTHENTIFICATION NOK      ********************//
        $('.id-button')
          .addClass('unauthentified')
          .removeClass('teal')
          .addClass('red')
          .html('Se connecter avec C-Yourmag');
        $('.disconnect').hide();
        $('.cookie').hide(); 
        $('#contentProfil').hide();
        $('#contentProfil2').hide();
        $('#contentProfil3').hide();
        return false;
    }
}

function        addButtonListener                                               () {
    //BUTTON SE CONNECTER
    $('.id-button.unauthentified').click(function(){
        $.cyouAuth( addConnectedInfo );
    });
    //BUTTON DECONNEXION
    $('.disconnect').click(function(){
        $.cyouDisconnect();
        addConnectedInfo(); //TODO NE MARCHE PAS, IL FAUT METTRE A JOUR... Faut-il rajouter un timer?
    //        location.reload();
    });

    $('.cookie').click(function(){
      $.cyouDeAuth(); 
      update();
    });

    $('#sendXP').click(function(){
        postLogVisite ( $('#scoreToSend').val() ); 
        updateScore();
    });

    $('#sendMedal').click(function(){
        csapi.postVisiteurMedaille(
            {
                "visiteur_id":          visiteur_id,
                "medaille_id":          $('#medalToValid').val()
            }
        );
        updateListMedaille();
    });

    addConnectedInfo();
}