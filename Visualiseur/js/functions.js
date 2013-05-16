// Tableau de donnÃ©es, une case = un enregistrement
var currentData;

var kmlObject;

// Instance de googleEarth
var ge;

function init() {

	// Chargement des animations
	$("#chooseFile").slideDown();
	
	// Chargement des evenements
	$("#filePath").bind("change", readFile);
	$("#fileKmlPath").bind("change", loadKml);
	// Chargement de google earth
	google.load("earth", "1");
	


}


function loadKml(evt) {

	var r = new FileReader();
		r.onload = function(e) {
		kmlfile = e.target.result;

	}
	r.readAsText(evt.target.files[0]);	
	
	//On ouvre joliment la div
	$("#googleEarthDiv").slideDown();
	
	// Nouvelle instance de google map
	google.earth.createInstance('googleEarthDiv', initCBKML, failureCB);
}

function loadKmlString(str) {
	kmlfile = str;
	
	//On ouvre joliment la div
	$("#googleEarthDiv").slideDown();
	
	// Nouvelle instance de google map
	google.earth.createInstance('googleEarthDiv', initCBKML, failureCB);
}

function initCBKML(instance) {
	ge = instance;
	ge.getWindow().setVisibility(true);
	ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
 
	kmlObject = ge.parseKml(kmlfile);
	
	 // Add the fetched KML into this Earth instance.
    ge.getFeatures().appendChild(kmlObject);

    // Walk through the KML to find the tour object; 
    // assign to variable 'tour'.
    walkKmlDom(kmlObject, function() {
      if (this.getType() == 'KmlTour') {
        tour = this;
        return false;
      }
    });
	
	ge.getTourPlayer().setTour(tour);
	ge.getTourPlayer().play();


}

function initCB(instance) {
    ge = instance;
    ge.getWindow().setVisibility(true);
    // panCameraTo(parseFloat(getDataFromRecording(currentData[0])[0]), parseFloat(getDataFromRecording(currentData[0])[1]));
   
    // add a navigation control
	ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
  
    ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
	ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
	ge.getSun().setVisibility(true);
	
	
	var href = 'http://developers.google.com/kml/documentation/kmlfiles/bounce_example.kml';
    google.earth.fetchKml(ge, href, kmlFinishedLoading);
	
   
}

function failureCB(errorCode) {
}

function panCameraTo(lat, long) {

	// On recupÃ¨re la vue courante
	var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	
	// Nouvelles coordonÃ©es
	lookAt.setLatitude(lat);
	lookAt.setLongitude(long);
	lookAt.setTilt(lookAt.getTilt() + 50.0);

	
	// On zoom six fois plus que la distance actuelle
	lookAt.setRange(400);
	
	// On update la vue sur google earth
	ge.getView().setAbstractView(lookAt);

}

function addPlaceMarkFromData(){

	$.each(currentData, function(index, value) {
		var dataArray = value.split(":");
		
		// CrÃ©ation du placemark
		var placemark = ge.createPlacemark('');
		
		// Icone perso
		var icon = ge.createIcon('');
		icon.setHref('http://maps.google.com/mapfiles/kml/paddle/red-circle.png');
		var style = ge.createStyle('');
		style.getIconStyle().setIcon(icon);
		placemark.setStyleSelector(style);
		
		// Placement
		var point = ge.createPoint('');

		point.setLatitude(parseFloat(dataArray[0]));
		point.setLongitude(parseFloat(dataArray[1]));
		placemark.setGeometry(point);
		placemark.setName("Position " + index);
		
		// On ajoute le marqueur
		ge.getFeatures().appendChild(placemark);
	});
}

function readFile(evt) {
	// Recupere le fichier envoyÃ©
	var file = evt.target.files[0];
	var kmlString = ''
				+	'<?xml version="1.0" encoding="UTF-8"?>'
				+	'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">'
				+	'<Document>'
				+	'<name>Un tour en ULM</name>'
				+	'<open>1</open>'
				+	'  <gx:Tour>'
				+	'<name>Lancer</name>'
				+	'	<gx:Playlist>';
	
	if (file) {
		if(getExtension(file.name)== "coords")
		{
			var r = new FileReader();
			r.onload = function(e) {
				currentData = e.target.result.split(";");
								
				$("#descrDataDiv").html("<b>Données récupérées: </b></br><div style='max-height :200px; overflow:auto; float:left;'><table BORDER='1' style='width : 400px;'><tr><th>Latitude</th><th>Longitude</th></tr>");
				$.each(currentData, function(index, value) {
								var sepDatas = value.split(":");
								var heading =60.0;
								if(currentData[index+1] !=null)
								{
									var nextDataSplit = currentData[index+1].split(":");
									heading = headToNextPoint(sepDatas[0], sepDatas[1], nextDataSplit[0],nextDataSplit[1]);
									
								}
								console.log("HEADING : " + parseFloat(heading));
								kmlString += '<gx:FlyTo>'
										+	'<gx:duration>3.0</gx:duration>'
										+	'<gx:flyToMode>smooth</gx:flyToMode>'
										+	'<Camera>'
										+	'<longitude>'+sepDatas[1]+'</longitude>'
										+	'<latitude>' + sepDatas[0]+'</latitude>'
										+	'<altitude>150</altitude>'
										+	'<altitudeMode>relativeToGround</altitudeMode>'
										+	'<heading>'+parseFloat(heading)+'</heading>'
										+	'<tilt>80.0</tilt>'
										+	'</Camera>'
										+	'</gx:FlyTo>';
								console.log("Data[0] : " +sepDatas[0]+ " data[1] : " + sepDatas[1]);
								$("#descrDataDiv table").append("<tr><td>"+sepDatas[0]+"</td><td>"+sepDatas[1]+"</td></tr>");
				});
				kmlString += '</gx:Playlist>'
						+	'</gx:Tour>'
						+	'</Document>'
						+	'</kml>';
				
				$("#descrDataDiv").append("</div>");
				//$("#descrDataDiv").prepend("<button onClick='playCamera()'>Play</button></br>");
				loadKmlString(kmlString);
			}
			r.readAsText(file);
		}
		else {
			alert("Type de fichier incorrecte. Veuillez fournir un fichier .coords");
		}
	}
	else {
		alert("Erreur lors du chargement du fichier");
	}
	
}

function playCamera()
{
	if(currentData != null)
	{
		var camera = ge.getView().copyAsCamera(ge.ALTITUDE_RELATIVE_TO_GROUND);
		camera.setTilt(90);
		camera.setAltitude(camera.getAltitude() - 10.0);
		//ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);

		var index = 0;
		
		function cameraToNextData() {
		
			setTimeout(function() {
				if(currentData.length <= index) {
					console.log("array < index");
					return;
				}
				var dataArray = currentData[index].split(":");
				var nextdataArray = null;
				if(currentData[index+1] !=null)
				{
					nextdataArray = currentData[index+1].split(":");
				}
				
				camera.setLatitude(parseFloat(dataArray[0]));
				camera.setLongitude(parseFloat(dataArray[1]));
				
				console.log("Data number " + index + " Lat = " +dataArray[0] + " Long = " + dataArray[1]);

				$("#descrDataDiv table tr").eq(index+1).css("background", "blue");
				
				
				
				if(nextdataArray != null)
				{
					// Get the current view.
					var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

					// Set new latitude and longitude values.
					lookAt.setLatitude(parseFloat(nextdataArray[0]));
					lookAt.setLongitude(parseFloat(nextdataArray[1]));

					// Update the view in Google Earth.
					ge.getView().setAbstractView(lookAt);
				}
				// Update the view in Google Earth.
				ge.getView().setAbstractView(camera);

				index++;
				cameraToNextData();
			}, 1000);
		}
		
		cameraToNextData();
		
	}
}

deg2rad = function(x) {return x*Math.PI/180;}

rad2deg = function(x) {return x * 180.0 / Math.PI;}
headToNextPoint = function(p1lat, p1long, p2lat, p2long) {
 /*var R = 6371; // earth's mean radius in km
 var dLat  = rad(p2lat -p1lat);
 var dLong = rad(p2long - p1long);

 var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
         Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 var d = R * c*/
 
	lat1 = deg2rad(p1lat);
	lon1 = deg2rad(p1long);
  
	lat2 = deg2rad(p2lat);
	lon2 = deg2rad(p2long);
  
	var heading = fixAngle(rad2deg(Math.atan2(
    Math.sin(lon2 - lon1) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) *
    Math.cos(lon2 - lon1))));

	return heading;
}

function fixAngle(a) 
{
	while (a < -180)
    a += 360;
  
  while (a > 180)
    a -= 360;
  
  return a;
}
function getDataFromRecording(recording)
{
	return recording.split(":");
}

function getExtension(fileName)
{
	var array = fileName.split(".")
	return array[1];
}