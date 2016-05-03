<?php
/*Just went through and refreshed myself on PHP scoping... I gotta say, I do like it better than JavaScript's way.
*Even though it's easier to fuck everything up, just even having the OPTION of editing global variables outside the global scope is comforting.
*Plus that was something that took me forever to get used to in JavaScript, but I learned to love when working over multiple files.
*/

$trackNum = $_POST['trackNum'];
$apiKey = ''; //null
$gmapKey = ''; //null

$reqURL = 'http://api.boxoh.com/v2/rest/key/'.$apiKey.'/track/'.$trackNum.'/?mapKey='.$gmapKey;
$sourceInfo = file_get_contents ($reqURL);

// PHP objects are so weird... they're just arrays with non integer keys. I'm actually really curious as to how this changes your perception on data storage. Maybe a conversation for another time.
// PS, I'm really curious as to how using $ to denote a variable and => to denote a key-value pair came about. They seem like really inefficient key presses for such common calls.

$decodedSourceInfo = json_decode ($sourceInfo);

// data :
/* 	deliveryEstimate : ""
* 	destination : null
*	isValid : true
*	shipmentStatus : "delivered"
*	shipper : "UPS"
*	tracking :
*		0 :
*			desc : "Delivered"
*			geo : 
*				lat : int
*				lon : int
*			loc :
*				city : str
*				country : str
*				territory : str
*			locStr : city .", ".territory
*			stamp : int
*			time : str
*	wasCacheHit : true
* result : "OK"
* secondsToExpiration : int
*/

$trackInfo = $decodedSourceInfo -> data -> tracking;

$majorLocs = array ();
$resonse = array ();
function pythagorasWasABastard ($geo_one, $geo_two) {

	$a = abs ($geo_one -> lat - $geo_two -> lat);
	$b = abs ($geo_one -> lon - $geo_two -> lon);
	$c = sqrt (pow ($a, 2) + sqrt (pow ($b, 2)));

	return ($c);
}

function formatData ($locStr, $desc, $time){
	$formatted = "<b>" . $locStr . "</b><br/>" . $desc . "<br/>" . $time;
	return ($formatted);
}

function iconSwitch ($trackInfo, $i){
	$length = count ($trackInfo)-1;
	switch ($i){
		case 0:
			return ("last");
		case $length:
			return ("first");
		default:
			return ("other");
	}
}

function dataPush ($trackInfo, $i){
	error_log (json_encode ($trackInfo));
	$info = $trackInfo[$i];
	$tempArray = array (
		"lat" => $info->geo->lat,
		"lon" => $info->geo->lon,
		"pointData" => formatData ($info->locStr, $info->desc, $info->time),
		"iconName" => iconSwitch ($trackInfo, $i)
	);
	array_push ($GLOBALS['majorLocs'], $tempArray);
}

function vetData ($trackInfo){
	for ($i = 0; $i < count ($trackInfo); $i++){
		if ($i == 0){
			dataPush ($trackInfo, $i);
		}
		elseif ($i == count ($trackInfo)-1){
			dataPush ($trackInfo, $i);
		}
		elseif ($trackInfo.desc == "Billing Information Received"){
		}
		elseif (pythagorasWasABastard ($trackInfo[$i-1]->geo, $trackInfo[$i]->geo) > 0.5){
			dataPush ($trackInfo, $i);
		}
	}
}

vetData ($trackInfo);

$response["center"] = array ("lat" => 40.000000, "lon" => 40.000000);
$response["data"] = $majorLocs;

error_log ($reqURL);
error_log (json_encode ($trackInfo));

echo (json_encode ($response));
