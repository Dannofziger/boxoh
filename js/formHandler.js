
//Angular Module
var websiteApp = angular.module('websiteApp', []);



websiteApp.controller('FormController', function($scope, $http){
	$scope.formData = {};
	$scope.submission = false;

	//Cookie Functions
	
	function addDiv (data) {
		var nuDiv = document.getElementById("previoustrackinginfo").appendChild(document.createElement('div'));
		nuDiv.innerHTML = '<a role="button" class="btn btn-primary" onclick="buttonRequest('+data+')"><span class="glyphicon glyphicon-search"></span> '+ data +'</a>';
	}
	
	function appendCookie (trackNum) {
		var cookie = document.cookie;
		var tempNum = trackNum;
		document.cookie = trackNum +" = "+ trackNum;
	}

	function populateRecent () {
		var cookie = document.cookie;
		console.log(cookie);
		if (cookie != '') {
			var cookieArr = cookie.split("; ");
			document.getElementById("previoustrackinginfo").innerHTML= '';
			for(i=0;i<cookieArr.length;i++){
				var tempCookie = cookieArr[i].split("=")[1];
				addDiv(tempCookie);
			}
		}
	}
	
	document.getElementById("body").onload = populateRecent();

	//More Angular Stuff
	var param = function(data){
		var d = 'trackNum';
		var returnString = '';
		for (d in data){
			if (data.hasOwnProperty(d)) {
				returnString += d + '=' + data[d] + '&';
			}
		}

		return returnString.slice(0, returnString.length - 1);
	};

	//Start Map Handling
	function createMarker(latLng, data, iconName, center, map) {
		var marker = new google.maps.Marker({
			position: latLng,
			icon: getIcon(iconName, latLng, center),
			title: "Checkpoint"
		});

		google.maps.event.addListener(marker, 'click', function () {
			infoWindow.setContent(data);
			infoWindow.open(map);
			infoWindow.setPosition(latLng);
		});

			marker.setMap(map);
	}

	function getIcon(icon, latLng, center) {

		var first = new google.maps.Marker({
			url: "http://www.boxoh.com/img/map_start.png",
			size: new google.maps.Size(20, 34),
			anchor: new google.maps.Point(10, 34),
			position: latLng,
			infoWindowAnchor: infoWindowAnchor = new google.maps.Point(10, 34)
		});

		first.shadow = "http://www.boxoh.com/img/map_shadow.png";
		first.shadowSize = new google.maps.Size(37, 34);
		var last = new google.maps.Marker({
			url: "http://www.boxoh.com/img/package.png",
			size: new google.maps.Size(31, 35),
			anchor: new google.maps.Point(15, 17),
			position: latLng,
			infoWindowAnchor: infoWindowAnchor = new google.maps.Point(15.5, 35)
		});

		var other = new google.maps.Marker({
			url: "http://www.boxoh.com/img/map_point.png",
			size: new google.maps.Size(20, 34),
			anchor: new google.maps.Point(10, 34),
			position: latLng,
			infoWindowAnchor: infoWindowAnchor = new google.maps.Point(10, 34)
		});

		other.shadow = "http://www.boxoh.com/img/map_shadow.png";
		other.shadowSize = new google.maps.Size(37, 34);

		eval('try{ret = '+icon+';}catch(e){ret=G_DEFAULT_ICON;}');
		return ret;
	}

	var infoWindow = new google.maps.InfoWindow();

	function populateMap(response) {
	var mapOptions = {

		center: new google.maps.LatLng(response.data.center.lat, response.data.center.lon),
		mapTypeId: google.maps.MapTypeId.TERRAIN
	}
	var map = new google.maps.Map(document.getElementById("bomap_canvas"), mapOptions);

	var bounds = new google.maps.LatLngBounds();
	map.setCenter(new google.maps.LatLng(response.data.center.lon, response.data.center.lat));

	var path = [];
	
	for (i = 0; i < response.data.data.length; i++){
		var nuResponse = response.data.data[i];

		latLng = new google.maps.LatLng(nuResponse.lat, nuResponse.lon);
		createMarker(latLng, nuResponse.pointData, nuResponse.iconName, response.data.center, map);
		bounds.extend(latLng);

		path.push(new google.maps.LatLng(nuResponse.lat, nuResponse.lon));
	}


	var polyOptions = {
		strokeColor: '#008AFF',
		strokeOpacity: 1.0,
		strokeWeight: 3,
		geodesic: true,
		path: path
	}

		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);
		map.fitBounds(bounds);
	}

	//Angular Form Submission

	$scope.submitButton = function(data){
		console.log(data);
	}

	$scope.submitForm = function(){
		console.log("formData: "+$scope.formData);
		$http({
			method : 'POST',
			url : '/server/track.php',
			data : param($scope.formData),
			headers : {'Content-Type' : 'application/x-www-form-urlencoded' }
		}).then(function successCallback(response){
			console.log(response.data);
			populateMap (response);
			appendCookie($scope.formData.trackNum);
			populateRecent();
		}, function errorCallback(response){
		});
	};
});
