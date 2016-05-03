//********************//
//  __  __   _   ___  //
// |  \/  | /_\ | _ \ //
// | |\/| |/ _ \|  _/ //
// |_|  |_/_/ \_\_|   //
//********************//

//Initializing map here allows me to add/remove markers without redrawing
//the whole map every time I want to search.
var map;

//Keep an array of the map markers so I can set their map to null to delete.
var mapMarkers = [];
//Keep an array of marker coordinates to use for the polyline. 
var travelPathArr = [];
var travelPath;
//Set up bounds for centering
var bounds = new google.maps.LatLngBounds();

function initMap(){
  //HTML map location
  var HTMLMap = document.getElementById('bomap_canvas');
  var mapOptions = {
    zoom : 2,
    center : {lat:0, lng:0},
//    mapTypeId : google.maps.mapTypeId.TERRAIN
  };

  map = new google.maps.Map(HTMLMap, mapOptions);
}

function addMarker(data){
  //Format position data
  var location = {lat: data.lat, lng: data.lon};
  //push location to travelPath and bounds
  travelPathArr.push(location);
  bounds.extend(new google.maps.LatLng(location));
  //Ensure the image is correct for its label
  var image;
  switch(data.iconName){
    case "other":
      image = "assets/map_point.png";
      break;
    case "last":
      image = "assets/package.png";
      break;
    case "first":
      image = "assets/map_start.png";
      break;
  }
  //Compile the marker info
  var markerObj = {
    position: location,
    map: map,
    icon: image,
    title: "Checkpoint"
  }
  //Create the marker
  var marker = new google.maps.Marker(markerObj);
  //Add marker click functionality
  var infoWindow = new google.maps.InfoWindow({
    content: data.pointData
  });

  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
  //Push marker to array
  mapMarkers.push(marker);
}
function removeMarkers(){
  for(var i = 0; i < mapMarkers.length; i++){
    mapMarkers[i].setMap(null);
  }
  if(travelPath){
    travelPath.setMap(null);
  }
  mapMarkers = [];
  travelPathArr = [];
}
function populateMap(response){
  //Remove previous markers
  removeMarkers();
  //Iterate through response and add markers for each entry
  for (var i = 0; i <  response.data.data.length; i++) {
    addMarker(response.data.data[i]);
  };
  //create polyline to connect the icons
  travelPath = new google.maps.Polyline({
    path: travelPathArr,
    geodesic: true,
    strokeColor: '#006699',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  //set polyline map
  travelPath.setMap(map);
  map.fitBounds(bounds);
  bounds = new google.maps.LatLngBounds();
}

initMap();
//************************************//
//   ___ ___   ___  _  _____ ___ ___  //
//  / __/ _ \ / _ \| |/ /_ _| __/ __| //
// | (_| (_) | (_) | ' < | || _|\__ \ //
//  \___\___/ \___/|_|\_\___|___|___/ //
//************************************//

function appendCookie(trackNum){
  var cookieObj = {};
  //take current cookie and put them in a usable data type
  if(document.cookie != ""){
    cookieObj = JSON.parse(document.cookie);
  }
 
  //Now that the cookie is an object, simply make the key and value the tracking
  // number so there are no repeats)
  cookieObj[trackNum] = trackNum;
  //put the cookie back
  document.cookie = JSON.stringify(cookieObj);
}

function removeCookie(trackNum){
  //similar situation
  var cookieObj = JSON.parse(document.cookie);

  //delete will remove the input property from the obj
  delete cookieObj[trackNum];

  //put the cookie back
  document.cookie = JSON.stringify(cookieObj);
  populateButtons();
}

function cookieArray(){
  //returns an array of the tracking numbers in the cookie
  var cookieObj = JSON.parse(document.cookie);
  
  //set the array to the keys of cookieObj
  var trackNumArr = Object.keys(cookieObj);
  return trackNumArr;
}

//***************************************//
//  ___ _   _ _____ _____ ___  _  _ ___  //
// | _ ) | | |_   _|_   _/ _ \| \| / __| //
// | _ \ |_| | | |   | || (_) | .` \__ \ //
// |___/\___/  |_|   |_| \___/|_|\_|___/ //
//***************************************// 
/*
//Create the button
function createButton(trackNum){
  //Create a new div where the button will live
  var nuDiv = document.getElementById("previoustrackinginfo")
    .appendChild(document.createElement('div'));

  //Fill that div with the info needed
  //I hate how the formatting worked out,
  //but it keeps with the 80 character line standard
  nuDiv.innerHTML = 
    '<label class="btn btn-primary">'+
      '<input type="radio" ng-click="submitButton(&quot;'+trackNum+'&quot;)"'+ 
        'value="'+trackNum+'">'+
      '<span class="glyphicon glyphicon-search"></span>'+
      trackNum+
    '</label>'+
    '<label class="btn btn-danger">'+
      '<input type="radio" onclick="removeCookie(&quot;'+trackNum+'&quot;)"'+ 
        'value="'+trackNum+'">'+
      'X'+
    '</label>';
}
//P.S. You can thank IBM and the 1890 census for that HTML monstrosity.
//http://programmers.stackexchange.com/a/148678

function populateButtons(){
  //First, get rid of all the previous buttons
  //document.getElementById("previoustrackinginfo").innerHTML = "";
  //Get an array of the tracking numbers
  //This whole thing breaks if cookies are blank, and there'd be no buttons if
  //that's the case anyways
  if(document.cookie !== ""){

    var trackNumArr = cookieArray();

    for (var i = 0; i < trackNumArr.length; i++) {
      var trackNum = trackNumArr[i];
      createButton(trackNum);
    };
  };
}
populateButtons();*/
//****************************************//
//    _   _  _  ___ _   _ _      _   ___  //
//   /_\ | \| |/ __| | | | |    /_\ | _ \ //
//  / _ \| .` | (_ | |_| | |__ / _ \|   / //
// /_/ \_\_|\_|\___|\___/|____/_/ \_\_|_\ //
//****************************************//
//Give the angular module a name
var websiteApp = angular.module('websiteApp', []);

//New angular controller for the form
websiteApp.controller('FormController', function ($scope, $http){
  
  //REST
  $scope.submitForm = function(){
    $http ({
      method : 'POST',
      url : '/server/track2.php',
      data : 'trackNum='+$scope.trackNum,
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    }).then (function successCallback(response){
      if(response.data != ""){
        //When successful, append the trackNum to the cookies,
        appendCookie($scope.trackNum);
        //repopulate the recent buttons,
        populateButtons();
        //and populate the map with the server response.
        populateMap(response);
      }else{
        alert("Invalid Tracking Number");
      }
    }, function errorCallback (response){
        //This should never be called.
        //The server should know when it's sending a faulty response
        alert("Check your internet connection");
    });
  };
});

websiteApp.controller('ButtonController', function ($scope, $http){
  $scope.submitButton = function(trackNum){
    $http ({
      method : 'POST',
      url : '/server/track2.php',
      data : 'trackNum='+trackNum,
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    }).then (function successCallback(response){
      console.log(response);
      if(response.data != ""){
        populateMap(response);
      }else{console.log(response);}
    }, function errorCallback (response){
      alert("");
    });
  };

});

websiteApp.directive('mybuttons', function($compile){
  createButton = function (trackNum){
    var HTMLOut = '<label class="btn btn-primary"><input type="radio" ng-click="submitButton(&quot;'+trackNum+'&quot;)"value="'+trackNum+'"><span class="glyphicon glyphicon-search"></span>'+trackNum+'</label><label class="btn btn-danger"><input type="radio" onclick="removeCookie(&quot;'+trackNum+'&quot;)" value="'+trackNum+'">X</label>';
    //HTMLOut = '<button ng-click="clickMe()">&quot'+trackNum+'&quot</button>';
    return {
      HTMLOut
    };
  }
  populateButtons = function(){
    if(document.cookie !== ""){
      var trackNumArr = cookieArray();
      output = "";

      for(var i = 0; i < trackNumArr.length; i++){
        var trackNum = trackNumArr[i];
        output += createButton(trackNum).HTMLOut;
      };
      return output;
    }
  }
  return {
    compile: function (element, attrs){
      var html = populateButtons();
      element.html(html);
    },
    link: function (){}
  }
});