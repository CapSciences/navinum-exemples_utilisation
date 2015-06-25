/*
CS API V2
*/


var CsApi = (function (window, document, $) {
    // private variables and functions
var visiteur_id = null, interactif_id = null, exposition_id = null, baseurl = null, phpBridgeUrl = null, weburl = null, visite_id = null, connection = null, navinum_id = null, contexte_id = null, pseudo_son = null;
var visiteur = null, interactif = null, exposition = null, mode_groupe = false, visiteur_group = [];
var start_at = null, end_at = null;
var lastResponse="";
var isOnError = false;
var isSuccess = true;

    // constructor
    var CsApi = function (args, context) {
        console.log(args);
        visiteur_id = args.visiteur_id;
        if(typeof args.visiteur_id === 'object'){
            mode_groupe = true;
            visiteur_group = args.visiteur_id;
            visiteur_id = args.visiteur_id[0];
        }
        visite_id       =   args.visite_id;
        contexte_id     =   args.contexte_id;
        interactif_id   =   args.interactif_id;
        exposition_id   =   args.exposition_id;
        connection      =   args.connection;

        if(typeof args.baseurl !== 'undefined')
            baseurl = args.baseurl;
        else
            baseurl = 'http://YOUR_ADRESS/api_test.php';

        if(typeof args.weburl !== 'undefined')
            weburl = args.weburl;
        else
            weburl = 'http://YOUR_ADRESS/';


        if(typeof args.ws_authentification !== 'undefined'){
            ws_authentification = args.ws_authentification;
        }else{
            ws_authentification = '';
        }


        if(typeof args.phpBridgeUrl !== 'undefined' && args.phpBridgeUrl !== ''){
            phpBridgeUrl = args.phpBridgeUrl;
            ws_authentification = '';
        }else{
            phpBridgeUrl = null;
        }

        if(typeof visite_id === 'undefined' || visite_id === null){
            if(typeof args.navinum_id !== 'undefined'){
                visite = this.getVisiteWithNavinumId(args.navinum_id);
                if( typeof visite === 'undefined' ){
                    if( typeof visiteur_id === 'undefined' || visiteur_id ===  null ){
                        visiteur = createVisiteur(args);
                        visiteur_id = visiteur.guid;
                    } else{
                        visiteur = getVisiteur(visiteur_id);
                    }
                    visite = createVisite(args);
                } 
                else {
                    visiteur_id = visite.visiteur_id;
                    visiteur = getVisiteur(visiteur_id);
                }
            }
            
        } else{
            visite = getVisite(visite_id);
        }


        if(typeof context === 'undefined' || context == 'insitu'){
            if(interactif_id){
                getInteractif(interactif_id);
            }
            if(exposition_id){
                getExposition(exposition_id);
            }
        }

      /* we get information with ws */
    };

    var returnSuccess = function(value){
      lastResponse = value;
      isOnError = false;
      isSuccess = true;
    };

    var returnError = function(value){
        console.log("===== ERROR =====");
        console.log(JSON.stringify(value));
      isOnError = true;
      isSuccess = false;
    };

    /* WS private */

    var getWebUrlVisiteur = function(){
        return weburl + 'visiteur/';
    };

    var getWebUrlExposition = function(){
        return weburl + 'exposition/';
    };

    var getWebUrlMedaille = function(){
        return weburl + 'medaille/';
    };

    var getWebUrlMedailleType = function(){
        return weburl + 'medaille_type/';
    };

    var getWebUrlInteractif = function(){
        return weburl + 'interactif/';
    };

    var getWebUrl = function(){
        return weburl;
    };

    var getInteractif = function (int_id) {
        var interactif_id = null;
        if(typeof int_id !== 'undefined'){
            interactif_id = int_id;
        }else{
            interactif_id = getInteractifGuid();
        }
        if(interactif_id == null){
            throw "interactif is null";
        }else{
            var data = { 'guid': interactif_id};
            getService('/interactif', data);
            interactif = lastResponse;
            interactif = interactif[0];
            return interactif;
        }
        };

    var getExpositions = function(data){
        getService('/exposition', data);
        exposition = lastResponse;
        return exposition;
    };

    var getExposition = function (expo_id) {
        var exposition_id = null;
        if(typeof expo_id !== 'undefined'){
            if(typeof expo_id == 'object'){
                return getExpositions(expo_id);
            }
            exposition_id = expo_id;
        }else{
            exposition_id = getExpositionGuid();
        }
        if(exposition_id == null){
            throw "exposition is null";
        }else{
          var data = { 'guid': exposition_id};
          getService('/exposition', data);
          exposition = lastResponse;
          exposition = exposition[0];
          return exposition;
        }
        };

    var getVisiteur= function (visi_id) {
        var visiteur_id = null;
        if(typeof visi_id !== 'undefined'){
            visiteur_id = visi_id;
        }else{
            visiteur_id = getVisiteurGuid();
        }
        if(visiteur_id == null){
            throw "visiteur is null";
        }else{
          var data = { 'guid': visiteur_id};
          getService('/visiteur', data);
          visiteur = lastResponse;
          visiteur = visiteur[0];
          return visiteur;
        }
    };

    var getVisiteursGroupe = function () {
        return visiteur_group;
    };

    var isModeGroupe= function () {
        return mode_groupe;
    };

    var generateGUID = function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    var createVisiteur= function (args) {
        var data = {};
        if(( typeof args.pseudo_son != 'undefined' || args.pseudo_son != null) &&
            (typeof args.email != 'undefined' || args.email != null) &&
            (typeof args.password_son != 'undefined' || args.password_son != null)){

            if(typeof args.pseudo_son != 'undefined'){
                data['pseudo_son'] = args.pseudo_son;
            }
            if(typeof args.email != 'undefined'){
                data['email'] = args.email;
            }
            if(typeof args.password_son != 'undefined'){
                data['password_son'] = args.password_son;
            }
            return createAuthenticatedVisiteur(data);

        }else if(( typeof args.pseudo_son != 'undefined' && args.pseudo_son != null) ||
            (typeof args.navinum_id != 'undefined' && args.navinum_id != null)){

            if(( typeof args.pseudo_son == 'undefined' || args.pseudo_son == null)){
                args.pseudo_son = 'visiteur_' + generateGUID();
            }

            if(typeof args.pseudo_son != 'undefined'){
                data['pseudo'] = args.pseudo_son;
            }

            return createAnonymousVisiteur(data);
        }else{
            throw 'Cannot create anonymous or authenticated visiteur : Missing data.';
        }
    };

    var createVisite= function (args) {
        return updateVisite(args);
    };

    var updateVisite= function(args){
        var data = {};

        if(typeof args.navinum_id == 'undefined' || args.navinum_id == null){
            console.debug('Cannot create visite : Missing navinum_id => guess create visite is not asked...');
            return;
        }else{
            data['navinum_id'] = args.navinum_id;
        }
        if((typeof args.visiteur_id == 'undefined' || args.visiteur_id == null) && visiteur_id != null ){
            args.visiteur_id = visiteur_id;
        }
        if(typeof args.visiteur_id == 'undefined' || args.visiteur_id == null ){
            throw 'Cannot update visite : Missing visiteur_id';
        }else{
            data['visiteur_id'] = args.visiteur_id;
        }
        if((typeof args.exposition_id == 'undefined' || args.exposition_id == null)){
            data['exposition_id'] = args.exposition_id;
        }
        if((typeof args.interactif_id == 'undefined' || args.interactif_id == null)){
            data['interactif_id'] = args.interactif_id;
        }
        if((typeof args.parcours_id == 'undefined' || args.parcours_id == null)){
            data['parcours_id'] = args.parcours_id;
        }
        postService('/visite/update', data);
        visite = lastResponse;
        visite = visite[0];
        if(typeof visite.guid == 'undefined'){
            throw "Cannot create visite : " + visite.toString();
        }
        return visite;
    }

    var createAuthenticatedVisiteur = function (data) {
        postService('/visiteur/create', data);
        visiteur = lastResponse;
        visiteur = visiteur[0];
        if(typeof visiteur.guid == 'undefined'){
            throw "Cannot create visiteur : " + visiteur.toString();
        }
        visiteur_id = visiteur.guid;
        return visiteur;

    };

    var createAnonymousVisiteur = function (data) {
        postService('/visiteur/createAnonymous', data);
        visiteur = lastResponse;
        visiteur = visiteur[0];
        if(typeof visiteur.guid == 'undefined'){
            throw "Cannot create anonymous visiteur : " + visiteur;
        }
        visiteur_id = visiteur.guid;
        return visiteur;
    };

    var getVisiteurGuid =  function(){
        return (typeof visiteur_id !== 'undefined')? visiteur_id : null;
    };

    var getVisiteGuid =  function(){
        return (typeof visite_id !== 'undefined') ? visite_id : null;
    };

    var getExpositionGuid =  function(){
        return (typeof exposition_id !== 'undefined') ? exposition_id : null;
    };

    var getInteractifGuid =  function(){
        return (typeof interactif_id !== 'undefined') ? interactif_id : null;
    };

    var getConnection =  function(){
        return (typeof connection !== 'undefined') ? connection : null;
    };

    var getVisite= function (visi_id) {
        var visite_id = null;
        if(typeof visi_id !== 'undefined'){
            visite_id = visi_id;
        }else{
            visite_id = getVisiteGuid();
        }
        if(visite_id == null){
          throw "visite is null";
        }else{
          var data = { 'guid': visite_id};
          getService('/visite', data);
          var visite = lastResponse;
          visite = visite[0];
          visite_id = visite.guid;
          return visite;
        }
        };

    var toType = function(obj) {
       return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    var calculAge = function (birthDate, otherDate) {
        birthDate = new Date(birthDate);

        var years = (otherDate.getFullYear() - birthDate.getFullYear());

        if (otherDate.getMonth() < birthDate.getMonth() ||
            otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
            years--;
        }

        return years;
    };

    var phpBridgeService = function(url, data){

    };

    var getService = function(service, data){

        if(phpBridgeUrl != null){
            var data = {'service': service, 'get': btoa(JSON.stringify(data))};
            $.ajax({
                type: "GET",
                url: phpBridgeUrl,
                crossDomain:true,
                async: false,
                data: data,
                dataType: "json",
                success: returnSuccess,
                error: function(response) {
                    console.log(response);
                    returnError( response );
                }
            });


        }else{
            var url = baseurl + service;
            $.ajax({

                type: "GET",

                // The URL to make the request to.
                url: url,
                crossDomain:true,
                async: false,
                data: data,
                dataType: "json",
                xhrFields: {},
                headers: {},
                beforeSend : function(xhr) {
                    if(ws_authentification){
                        xhr.withCredentials = true;
                        var base64 = btoa(ws_authentification);
                        //console.log('base64',ws_authentification, base64);
                        xhr.setRequestHeader("Authorization", "Basic " + base64);
                    }
                },
                success: returnSuccess,
                error: function(response) {
                    console.log(response);
                    returnError( response );
                }
            });
        }
      return isSuccess;
  };

    var postService = function(service, data){
        if(phpBridgeUrl != null){
            var data = {'service': service, 'post': btoa(JSON.stringify(data))};
            $.ajax({
                type: "POST",
                url: phpBridgeUrl,
                async: false,
                data: data,
                dataType: "json",
                success: returnSuccess,
                error: function(response) {
                    console.log(response);
                    returnError( response );
                }
            });


        }else{

            //console.log("postService " + service + "api", data);
            var url = baseurl + service;
              $.ajax({

                      type: 'POST',
                      // The URL to make the request to.
                      url: url,
                      crossDomain:true,
                      async: false,
                      data: JSON.stringify(data),
                      dataType: "json",
                      xhrFields: {},
                      beforeSend : function(xhr) {
                          if(ws_authentification){
                              xhr.withCredentials = true;
                              var base64 = btoa(ws_authentification);
                              //console.log('base64',ws_authentification, base64);
                              xhr.setRequestHeader("Authorization", "Basic " + base64);
                          }
                      },
                      headers: {},
                      success: returnSuccess,
                      error: function(response) {
                        returnError( response );
                      }
                    });
        }
        return isSuccess;
  };

    var putService = function(service, data){
        if(phpBridgeUrl != null){
            var data = {'service': service, 'put': btoa(JSON.stringify(data))};
            $.ajax({
                type: "POST",
                url: phpBridgeUrl,
                async: false,
                data: data,
                dataType: "json",
                success: returnSuccess,
                error: function(response) {
                    returnError( response );
                }
            });


        }else{

            var url = baseurl + service;
            $.ajax({

                type: 'PUT',
                // The URL to make the request to.
                url: url,
                crossDomain:true,
                async: false,
                data: JSON.stringify(data),
                dataType: "json",
                xhrFields: {},
                beforeSend : function(xhr) {
                    if(ws_authentification){
                        xhr.withCredentials = true;
                        var base64 = btoa(ws_authentification);
                        //console.log('base64',ws_authentification, base64);
                        xhr.setRequestHeader("Authorization", "Basic " + base64);
                    }
                },
                headers: {},
                success: returnSuccess,
                error: function(response) {
                    returnError( response );
                }
            });
        }
        return isSuccess;
    };


    // prototype
    CsApi.prototype = {
        constructor: CsApi,

        getWebUrl: function(){
            return getWebUrl();
        },

        getWebUrlExposition: function(){
            return getWebUrlExposition();
        },

        getWebUrlInteractif: function(){
            return getWebUrlInteractif();
        },

        getWebUrlMedaille: function(){
            return getWebUrlMedaille();
        },

        getWebUrlMedailleType: function(){
            return getWebUrlMedailleType();
        },

        getWebUrlVisiteur: function(){
            return getWebUrlVisiteur();
        },

        getInteractif: function (int_id) {
            return getInteractif(int_id);
        },

        getVisiteur: function (visi_id) {
            var visiteur_id = null;
            if(typeof visi_id === 'undefined'){
                visiteur_id = this.getVisiteurGuid();
            }else{
                visiteur_id = visi_id;
            }
            return getVisiteur(visiteur_id);
        },

        getVisiteursGroupe: function () {
            return getVisiteursGroupe();
        },

        isModeGroupe: function () {
            return isModeGroupe();
        },

        getVisiteurGuid: function () {
            return getVisiteurGuid();
        },

        getVisiteGuid: function () {
            return getVisiteGuid();
        },

        getExpositionGuid: function () {
            return getExpositionGuid();
        },

        getExposition: function (expo_id) {
            return getExposition(expo_id);
        },

        getInteractifGuid: function () {
            return getInteractifGuid();
        },

        getVisite: function (visi_id) {
            return getVisite(visi_id);
        },

        getExpositions: function(){
            return getExpositions();
        },

        getVisiteurId: function () {
          return getVisiteurGuid();
        },
        getInteractifId: function () {
          return getInteractifGuid();
        },
        getVisiteId: function () {
          return getVisiteGuid();
        },
        getExpositionId: function () {
          return getExpositionGuid();
        },
        getNavinumId: function () {
          return navinum_id;
        },
        getConnection: function () {
          return connection;
        },
        getBaseurl: function () {
          return baseurl;
        },
        getInteractifVariable: function () {
        	if ( interactif === null )
                getInteractif( interactif_id );
          return interactif;
        },
        getVisiteurProfile: function () {
          return getVisiteur();
        },
        getExpositionVariable: function () {
          return exposition;
        },
        getVisiteVariable: function () {
          return visite;
        },
        getPhotoVisiteur: function(){
            return getWebUrlVisiteur() + '/' + visiteur.guid + '/photo.jpg';
        },
        getEmail:function () {
          return visiteur.email;
        },
        getPseudo:function () {
          return visiteur.pseudo_son;
        },
        getGender:function () {
          return visiteur.genre;
        },
        getAge:function () {
          var age = calculAge(visiteur.date_naissance, new Date());
          return age;
        },
        getDateOfBirth:function () {
          return visiteur.date_naissance;
        },
        getLogVisites: function (data) {

          var log_visites = null;
          if(typeof data === 'undefined'){
              if(!getVisiteurGuid()){
                  throw "visiteur is null";
              }
              data =  { 'visiteur_id' : getVisiteurGuid() };
          }
            //data = construct_get_url(data);
            getService('/log_visite', data);
            log_visites = lastResponse;
          return log_visites;
        },
        getLastLogVisite: function (data) {
          if(typeof data === 'undefined' ){
        	  data = { 'sort_by' : 'created_at', 'sort_order' : 'desc', 'limit' : '1' };
          }else{
        	  $.extend(data, { 'sort_by' : 'created_at', 'sort_order' : 'desc', 'limit' : '1' });
          }
          //data = construct_get_url(data);
          getService('/log_visite', data);
          var log_visite = lastResponse[0];
          return log_visite;
        },

        getLastLog: function (data) {
           return this.getLastLogVisite(data);
        },

        createLogVisite: function (data) {
          success = true;
          if(typeof data === 'undefined'){
            return JSON.stringify({'code' : 'ERR_CREATE', message : 'the parameter start_at is mandatory) '});
          }
            if(data === "object")
            {
                if(!data.hasOwnProperty("start_at"))
                    return JSON.stringify({'code' : 'ERR_CREATE', message : 'the parameter start_at is mandatory) '});
            }

         if(typeof data['visiteur_id'] === 'undefined' && getVisiteurGuid()!= null){
             data['visiteur_id'] = getVisiteurGuid();
         }

        if(typeof data['visite_id'] === 'undefined' && getVisiteGuid()!= null){
            data['visite_id'] = getVisiteGuid();
        }

        if(typeof data['interactif_id'] === 'undefined' && getInteractifGuid()!= null){
            data['interactif_id'] = getInteractifGuid();
        }

        if(typeof data['connection'] === 'undefined' && getConnection()!= null){
            data['connection'] = getConnection();
        }

        if(typeof data['exposition_id'] === 'undefined' && getExpositionGuid()!= null){
            data['exposition_id'] = getExpositionGuid();
        }
            /*
          if(data.from_app == 'insitu'){
              $.extend(data, { 'visiteur_id' : visiteur_id, "visite_id" : visite_id, "interactif_id" : interactif_id, "exposition_id" : exposition_id, "connection" : connection });
          }else{
              $.extend(data, { 'visiteur_id' : visiteur_id, "interactif_id" :  interactif_id, "connection" : connection });
          }*/
          postService('/log_visite/create', data);
          return lastResponse;
        },

        getScoreVisite: function (visi_id) {
            var visite_id = null;
            if(typeof visi_id !== 'undefined'){
                visite_id = visi_id;
            }else{
                visite_id = getVisiteGuid();
            }
            if(visite_id == null){
                throw "visite is null";
            }else{
                var data =  { 'visite_id' : visite_id };
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var visite_score  = lastResponse[0];

                return visite_score.total;
            }
        },

        getScoreVisiteurUnivers: function (visiteur_id, univers_id) {
            if(typeof visiteur_id === 'undefined' || typeof univers_id === 'undefined'){
                throw "univers_id and visiteur_id must be defined";
            }else{
                var data =  { univers_id : univers_id, visiteur_id:  visiteur_id};
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var visite_score  = lastResponse[0];
                if(typeof visite_score.total !== 'undefined'){
                    return visite_score.total;
                }
                return visite_score;
            }
        },

        getScoreVisiteurExposition: function (visiteur_id, exposition_id) {
            if(typeof visiteur_id === 'undefined' || typeof exposition_id === 'undefined'){
                throw "exposition_id and visiteur_id must be defined";
            }else{
                var data =  { exposition_id : exposition_id, visiteur_id:  visiteur_id};
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var visite_score  = lastResponse[0];
                if(typeof visite_score.total !== 'undefined'){
                    return visite_score.total;
                }
                return visite_score.total;
            }
        },

        getScoreVisiteurInteractif: function (visi_id, inter_id) {
            var visiteur_id = null;
            var interactif_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }
            if(typeof inter_id !== 'undefined'){
                interactif_id = inter_id;
            }else{
                interactif_id = getInteractifGuid();
            }
            if(interactif_id == null){
                throw "interactif is null";
            }

            if(visiteur_id && interactif_id){
                var data =  { 'visiteur_id' : visiteur_id, 'interactif_id' : interactif_id };
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var visiteur_score  = lastResponse[0];

                return visiteur_score.total;
            }

        },
        getScoreInteractif: function (inter_id) {
            var interactif_id = null;
            if(typeof inter_id !== 'undefined'){
                interactif_id = inter_id;
            }else{
                interactif_id = getInteractifGuid();
            }
            if(interactif_id == null){
                throw "interactif is null";
            }else{
                var data =  { 'interactif_id' : interactif_id };
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var interactif_score  = lastResponse[0];

                return interactif_score.total;
            }

        },
        getScoreVisiteInteractif: function (visi_id, inter_id) {
            var visite_id = null;
            var interactif_id = null;
            if(typeof visi_id !== 'undefined'){
                visite_id = visi_id;
            }else{
                visite_id = getVisiteGuid();
            }
            if(visite_id == null){
                throw "visite is null";
            }
            if(typeof inter_id !== 'undefined'){
                interactif_id = inter_id;
            }else{
                interactif_id = getInteractifGuid();
            }
            if(interactif_id == null){
                throw "interactif is null";
            }

            if(visite_id && interactif_id){

                var data =  { 'interactif_id' : interactif_id , 'visite_id' : visite_id};
                //data = construct_get_url(data);
                getService('/log_visite/total', data);
                var visite_interactif_score  = lastResponse[0];

                return visite_interactif_score.total;
            }
        },
        getInteractifs: function (expo_id) {
            var exposition_id = null;
            if(typeof expo_id !== 'undefined'){
                exposition_id = expo_id;
            }else{
                exposition_id = getExpositionGuid();
            }
            if(exposition_id == null){
                throw "exposition is null";
            }else{

              var data = { "exposition_id" : exposition_id };
              //data = construct_get_url(data);
              getService('/interactif', data);
              var interactifs = lastResponse;
              return interactifs;
            }
        },
        getParcours: function (expo_id) {
            var exposition_id = null;
            if(typeof expo_id !== 'undefined'){
                exposition_id = expo_id;
            }else{
                exposition_id = getExpositionGuid();
            }
            if(exposition_id == null){
                throw "exposition is null";
            }else{
              var data = { "exposition_id":  exposition_id };
              //data = construct_get_url(data);
              getService('/parcours', data);
              var parcours = lastResponse;
              return parcours;
            }
        },
        getvisiteurNeeds: function (expo_id) {
            var exposition_id = null;
            if(typeof expo_id !== 'undefined'){
                exposition_id = expo_id;
            }else{
                exposition_id = getExpositionGuid();
            }
            if(exposition_id == null){
                throw "exposition is null";
            }else{
              var data = { "exposition_id" : exposition_id };
              //data = construct_get_url(data);
              getService('/exposition_visiteur_needs', data);
              //console.log("data", JSON.stringify(data))
              var needs = lastResponse;
              return needs;
            }
        },
       postVisiteurPreference: function (preference_media_ids) {
          success = true;
          if(!preference_media_ids || preference_media_ids == undefined)
            return JSON.stringify({'code' : 'ERR_CREATE', message : 'the paramater preference_media_ids is mandatory) '});

          data = {'preference_media_id' : preference_media_ids, "guid" : visiteur_id };
          postService('/visiteur/createVisiteurPreference', data);
          return lastResponse;
        },
        getXp:function (visi_id, typologie_id) {
            var visiteur_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }else{
                var data = { "visiteur_id" : visiteur_id};
                if(typologie_id)
                    $.extend(data, {"typologie_id" : typologie_id});
                //data = construct_get_url(data);
                getService('/xp', data);
                var xp = lastResponse;
                return xp;
            }

        },
       postVisiteurXp: function (data) {
          success = true;
           var visiteur_id = null;
           //visi_id, score, typologie_id
           if(typeof data === 'undefined' || typeof data.score === 'undefined' || typeof data.typologie_id === 'undefined'){
               throw "you must have score and typologie_id parameters";
           }else{
               if(typeof data.visiteur_id === 'undefined'){
                   data.visiteur_id = getVisiteurGuid();
               }
               if(data.visiteur_id == null){
                   throw "you must have visiteur_id parameter";
               }else{
                   postService('/xp/create', data);
                   return lastResponse;
               }
           }
        },

        getVisiteurInteractifHighScore:function(visi_id, inter_id) {
            var visiteur_id, interactif_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }

            if(typeof inter_id !== 'undefined'){
                interactif_id = inter_id;
            }else{
                interactif_id = getInteractifGuid();
            }

            if(visiteur_id == null || interactif_id == null){
                throw "visiteur and interactif must be set";
            }else{
                var data = {'visiteur_id' : visiteur_id, 'interactif_id': interactif_id};
                //data = construct_get_url(data);
                getService('/log_visite/highScore', data);
                var highScore = lastResponse[0];
                if(typeof highScore === 'undefined' || typeof highScore.highScore === 'undefined' || highScore.highScore == null )
                    return 0;

                return highScore.highScore;
            }
        },

        getVisiteurHighScore:function (visi_id) {
            var visiteur_id = null;
            if(visi_id !== undefined){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }else{
                var data = {'visiteur_id' : visiteur_id};
                //data = construct_get_url(data);
                getService('/log_visite/highScore', data);
                var highScore = lastResponse[0];
                if(typeof highScore === 'undefined' || typeof highScore.highScore === 'undefined' || highScore.highScore == null )
                    return 0;

                return highScore.highScore;
            }
        },


        getVisiteurInteractifsExposition:function (visi_id, expo_id) {
            var visiteur_id = null;
            var exposition_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }
            if(typeof expo_id !== 'undefined'){
                exposition_id = expo_id;
            }else{
                exposition_id = getExpositionGuid();
            }
            if(exposition_id == null){
                throw "exposition is null";
            }

            var data = {"visiteur_id" : visiteur_id, "exposition_id": exposition_id};
            //data = construct_get_url(data);
            getService('/log_visite/visiteurInteractifsExposition', data);
            return lastResponse;
        },

        getVisiteurExposition: function(visi_id){
            var visiteur_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }

            if(visiteur_id == null){
                throw "visiteur is null";
            }else{
                var data = {"visiteur_id" : visiteur_id};
                //data = construct_get_url(data);
                getService('/log_visite/visiteurExpositions', data);
                return lastResponse;
            }
        },

        getInteractifHighScore:function (inter_id) {
            var interactif_id = null;
            if(typeof inter_id !== 'undefined'){
                interactif_id = inter_id;
            }else{
                interactif_id = getInteractifGuid();
            }
            if(interactif_id == null){
                throw "interactif is null";
            }else{
              var data = {'interactif_id' : interactif_id};
              //data = construct_get_url(data);
              getService('/log_visite/highScore', data);
              var highScore = lastResponse[0];

              if(typeof highScore === 'undefined' || typeof highScore.highScore === 'undefined' || highScore.highScore == null )
                return 0;

              return highScore.highScore;
            }
        },

        getLogVisiteHighScore:function (data) {
            if(typeof data === 'undefined'){
                return JSON.stringify({'code' : 'ERR_GET', message : 'at least one parameter is mandatory) '});

            }else{
                //data = construct_get_url(data);
                getService('/log_visite/highScore', data);
                var highScore = lastResponse[0];

                if(typeof highScore === 'undefined' || typeof highScore.highScore === 'undefined' || highScore.highScore == null )
                    return 0;

                return highScore.highScore;
            }
        },


        getLogVisiteHighScoreV2:function (data) {
            if(typeof data == 'undefined'){
                return JSON.stringify({'code' : 'ERR_GET', message : 'at least one parameter is mandatory) '});
            }
            getService('/log_visite/highScoreV2', data);
            var highScore = lastResponse;
            if(typeof highScore === 'undefined'){
                return {};
            }

            return highScore;
        },

        getScores: function(data) {
          if(typeof data === 'undefined')
             return JSON.stringify({'code' : 'ERR_GET', message : 'at least one parameter is mandatory) '});
          //data = construct_get_url(data);
          getService('/log_visite', data);
          return lastResponse;
        },
        getVisiteurXpTotal: function (visi_id) {
            var visiteur_id = null;
            if(typeof visi_id !== 'undefined'){
                visiteur_id = visi_id;
            }else{
                visiteur_id = getVisiteurGuid();
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }else{
              var data = { "visiteur_id" : visiteur_id};
              //data = construct_get_url(data);
              getService('/xp/total', data);
              var xp = lastResponse[0];
              return xp.total;
            }

        },
        getCsp:function () {
          var data = {};
          //data = construct_get_url(data);
          getService('/csp', data);
          var csp = lastResponse;
          return csp;
        },
        getMailTemplates:function () {
          var data = {};
          //data = construct_get_url(data);
          getService('/template', data);
          var template = lastResponse;
          return template;
        },
        getTypologies: function () {
          var data = {};
          //data = construct_get_url(data);
          getService('/typologie', data);
          var typologies = lastResponse;
          return typologies;
        },
        getMedaille: function (data) {
          if(typeof data === 'undefined'){
              data = {};
          }
          //data = construct_get_url(data);
          getService('/medaille', data);
          var medailles = lastResponse;
          return medailles;
        },
        getMedailleType: function (data) {
            if(typeof data === 'undefined') var data = {};
            //data = construct_get_url(data);
            getService('/medaille_type', data);
            var medailles = lastResponse;
            return medailles;
        },
        getLangues: function () {
          var data = {};
          //data = construct_get_url(data);
          getService('/langue', data);
          var langues = lastResponse;
          return langues;
        },
        getVisiteurMedailles: function (data) {
          if(typeof data !== 'undefined' && typeof data === 'string'){
            var data = {'visiteur_id': data};
          }else if(typeof data === 'undefined' || typeof data.visiteur_id === 'undefined' && getVisiteurGuid() != null){
            var data = {'visiteur_id': getVisiteurGuid()};
          }
          if(typeof data === 'undefined' || typeof data.visiteur_id === 'undefined'){
              throw "data must have visiteur_id parameters";
          }else{
              //data = construct_get_url(data);
              data['sort_by'] = 'created_at';
              data['sort_order'] = 'asc';
              getService('/visiteur_medaille', data);
              var medailles = lastResponse;
              return medailles;
          }
        },

        getBestVisiteurXp: function () {
            var data = {};
            getService('/xp/totalBestVisiteur', data);
            var xp = lastResponse;
            return xp;
        },

        getXpScoreByTypology: function (data) {
            //var data = construct_get_url(data);
            getService('/xp', data);
            var xp = lastResponse;
            return xp;
        },

       postVisiteurMedaille: function (data) {
          var success = true;
           if(typeof data === 'undefined' || typeof data.medaille_id === 'undefined'){
               throw "data must have medaille_id parameters";
           }else{
               if(typeof data.visiteur_id === 'undefined'){
                   data.visiteur_id = getVisiteurGuid();
               }
               if(data.visiteur_id == null){
                   throw "data must have visiteur_id parameters";
               }else{
                   postService('/visiteur_medaille/create', data);
                   return lastResponse;
               }
           }
        },
        postEndVisite: function (data) {
            if(typeof data === 'undefined' || typeof data.navinum_id === 'undefined' || typeof data.exposition_id === 'undefined'){
                throw "data must have visiteur_id navinum_id exposition_id parameters";
            }else{
                $.extend(data, { 'is_ending' : true });
                postService('/visite/update?guid='+visite_id, data);
                return lastResponse;
            }

        },
        
        postEndSession: function (data) {
            //data = {'visiteur_id' : visiteur_id, 'navinum_id' : navinum_id, 'exposition_id' : exposition_id, 'interactif_id' : interactif_id, 'connexion_id': Math.floor(Math.random() * 100).toString()};
            if(typeof data === 'undefined' || typeof data.navinum_id === 'undefined' || typeof data.exposition_id === 'undefined'){
                throw "data must have visiteur_id navinum_id exposition_id parameters";
            }else{
                $.extend(data, {'connexion_id': Math.floor(Math.random() * 100).toString() });
            }

            data = {'visiteur_id' : visiteur_id, 'navinum_id' : navinum_id, 'exposition_id' : exposition_id, 'interactif_id' : interactif_id };
            postService('/visite/update?guid='+visite_id, data);
          return lastResponse;
        },

        getVisiteurParcours: function (visi_id) {
            var visiteur_id = null;
            if(typeof visi_id !== 'undefined'){
                var visiteur_id = visi_id;
            }
            if(visiteur_id == null){
                throw "visiteur is null";
            }else{
              var data = {'visiteur_id' : visiteur_id};
              //data = construct_get_url(data);
              getService('/visite', data);
              var parcours = lastResponse;
              return parcours;
            }
        },
        changeParcours: function (data) {
          postService('/visite/update?guid='+visite_id, data);
          return lastResponse;
        },
        sendMail: function (data) {
          if(typeof data === 'undefined')
             return JSON.stringify({'code' : 'ERR_MAIL', message : 'these parameters are mandatory (mail_to, mail_from, subject, content) ) '});

          postService('/sentMessage/send', data);
          return lastResponse;
        },
        sendDocument: function (data) {
            //data = {'visiteur_id' : visiteur_id, 'navinum_id' : navinum_id, 'exposition_id' : exposition_id, 'interactif_id' : interactif_id, 'connexion_id': Math.floor(Math.random() * 100).toString()};
            if(typeof data === 'undefined' || typeof data.visiteur_id === 'undefined' || typeof data.interactif_id === 'undefined' || typeof data.filename === 'undefined' || typeof data.filebase64 === 'undefined'){
                throw "data must have visiteur_id interactif_id filename filebase64 parameters";
            }
            data.filebase64 = escape(data.filebase64);
            postService('/visiteur/sendDocument', data);
            return lastResponse;
        },
        browseInteractifDocuments: function (data) {
            if(typeof data === 'undefined' || typeof data.interactif_id === 'undefined'){
                throw "data must have interactif_id parameter";
            }
            getService('/interactif/browseDocuments', data);
            return lastResponse;
        },
        browseVisiteurDocuments: function (data) {
            if(typeof data === 'undefined' || typeof data.visiteur_id === 'undefined'){
                throw "data must have visiteur_id parameter";
            }
            getService('/visiteur/browseDocuments', data);
            return lastResponse;
        },
        getStartAt: function () {
          return start_at;
        },
        getEndAt: function () {
          return end_at;
        },
        setEndAt: function (end_date_timestamp) {
           end_at = end_date_timestamp;
        },
        setStartAt: function (start_date_timestamp) {
           start_at = start_date_timestamp;
        },

        // rechercher une visite à partir d'un navinum_id
        getVisiteWithNavinumId: function (navinum_id) {
            if(navinum_id == ''){
                throw "navinum_id is not defined";
            }
            var data = { 'navinum_id': navinum_id};
            getService('/visite', data);
            var visite = lastResponse;
            visite = visite[0];
            return visite;

        },

        // avoir le nombre de médailles total d'un univers
        getMedaillesCountFromUnivers: function(univers_id){
            if(typeof univers_id === 'undefined'){
                throw 'univers_id must be defined';
            }
            var univers =  this.getUnivers(univers_id);
            if(! univers.length){
                return 0;
            }else{
                return univers[0]['Medaille'].length;
            }
        },

        getUnivers: function(univers_id, is_active){
            var data = {};
            if(typeof univers_id !== 'undefined'){
                data['guid'] = univers_id;
            }
            if(typeof is_active !== 'undefined'){
                data['is_active'] = is_active;
            }
            getService('/univers', data);
            var univers = lastResponse;
            return univers;
        },

        getGain: function (gain_id) {
            if(typeof gain_id === 'undefined'){
                throw "gain_id must be defined";
            }else{
                var data =  { guid : gain_id};
                //data = construct_get_url(data);
                getService('/gain', data);
                var gain  = lastResponse[0];
                return gain;
            }
        },

        updateVisiteurGain: function (guid, data) {
            var valid = false;
            if(data.guid === 'undefined'){
                throw "parameters guid mandatory";
            }

            if(typeof data === 'undefined'){
                throw "data must be defined";
            }
            //data = construct_get_url(data);
            putService('/visiteur_univers_status_gain/' + guid, data);
            var gain  = lastResponse;
            return gain;
        },

        // avoir le status pour un univers pour un visiteur
        getLastVisiteurUniversStatus: function(visiteur_id, univers_id){
            if(typeof visiteur_id === 'undefined'){
                throw 'visiteur_id must be defined';
            }
            if(typeof univers_id === 'undefined'){
                throw 'univers_id must be defined';
            }
            this.getVisiteurUniversStatus({
                visiteur_id: visiteur_id,
                univers_id: univers_id,
                sort_by: 'UniversStatus.level',
                sort_order: 'desc',
                limit: 1
            });
            var visiteur_univers_status_gain = lastResponse;
            if(visiteur_univers_status_gain.length){
                return visiteur_univers_status_gain[0];
            }
            return null;
        },

        getVisiteurUniversStatus: function(data){
            if(typeof data.visiteur_id === 'undefined'){
                throw 'visiteur_id must be defined';
            }
            if(typeof data.univers_id === 'undefined'){
                throw 'univers_id must be defined';
            }
            getService('/visiteur_univers_status_gain', data);
            var visiteur_univers_status_gain = lastResponse;
            return visiteur_univers_status_gain;
        },

        getRfidGroupeVisiteur: function(data){
            if(typeof data === 'undefined'){
                throw 'parameters must be defined (guid or rfid_groupe_id or langue_id or email)';
            }
            getService('/rfid_groupe_visiteur', data);
            var visiteur_univers_status_gain = lastResponse;
            return visiteur_univers_status_gain;
        },


        exit: function(){
            Android.exit();
        },
        /**
         * Function called when logout button is pressed in Insitu apps html5 version
         * @param callbackFunction
         * @type function
         */
        onLogout: function(callbackFunction){
            callbackFunction();
        }
    };

    // return module
    return CsApi;
})(window, document, jQuery);
