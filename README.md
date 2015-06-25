# navinum-exemples_utilisation

Ce projet contient 6 tutoriels.

1) 	le plus complet est "connectionSSO.html" qui nécessitera un server PHP.
	Il vous montrera les différentes phases pour établir une connexion via le SSO et les différentes configurations nécessaire pour son bon fonctionnement.
	Besoin:
		- 	le CLIENT_ID 
		- 	le CLIENT_SECRET
	
	
	
2) 	getInteractifsInfo.html
	Permet: 
		-	Récupérer l'ensemble des infos pour un interactif donné.
	Besoin:
		- 	le GUID interactif
		
		
		
3)	getInteractifsMedals.html
	Permet: 
		-	Récupérer l'ensemble des infos des médailles d'un interactif donné.
	Besoin:
		- 	le GUID interactif
	NB: Le maximum d'info pour les médailles doivent être renseigné dans la base afin que le centre puissent garder la main dessus. (par exemple nombre de points nécessaire pour obtention.

	
	
4)	getXBestScore.html
	Permet: 
		-	Récupérer les X meilleurs scores d'un interactif donné.
	Besoin:
		- 	le GUID interactif
	NB: plusieurs paramêtres existe pour cette fonction (cf documentation online).	
	

	
5)	postMedals.html
	Permet: 
		-	De valider une médaille.
	Besoin:
		- 	le GUID médaille
		-	le GUID visiteur (SSO ?) 		
		-	le GUID univers si votre interactif appartient à un univers.
		-	le contexte.
	
	
	
6)	sendLogVisiteAndXP.html
	Permet: 
		-	D'envoyer un log visite et les XP par typologie pour un interactif.
	Besoin:
		- 	le GUID interactif
		-	le GUID visiteur (SSO ?) 		
	NB: plusieurs paramètres existe pour cette fonction (cf documentation online).	