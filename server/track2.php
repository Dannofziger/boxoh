<?php

$trackNum = $_POST['trackNum'];
$apiKey = '';
$gmapKey = '';

$reqURL = 'http://api.boxoh.com/v2/rest/key/'.$apiKey.'/track/'.$trackNum.'/?mapKey='.$gmapKey;

$sourceInfo = file_get_contents ($reqURL);
$decodedSourceInfo = json_decode ($sourceInfo);
if($decodedSourceInfo -> result == 'error'){
  echo "";
  exit();
}

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

function vetData ($trackInfo){
  $processing = array_pop($trackInfo);
  $infoLength = count($trackInfo);

  for ($i = 0; $i < $infoLength; $i++){
    if(is_numeric($trackInfo[$i] -> geo -> lat)){
      $info = $trackInfo[$i];
      $tempArray = array(
        "lat" => $info -> geo -> lat,
        "lon" => $info -> geo -> lon,
        "pointData" => formatData($info -> locStr, $info -> desc, $info -> time),
        "iconName" => "other"
      );
      array_push($GLOBALS['majorLocs'], $tempArray);
      if (pythagorasWasABastard($info -> geo, $trackInfo[$i+1] -> geo) < 0.5) {
        $i++;
      }
    }
  }
  $GLOBALS['majorLocs'][0]['iconName'] = "last";
  $GLOBALS['majorLocs'][count ($GLOBALS['majorLocs'])-1]['iconName'] = "first";
}

vetData ($trackInfo);

$response["center"] = array ("lat" => 40.000000, "lon" => 40.000000);
$response["data"] = $majorLocs;

error_log ($reqURL);
error_log (json_encode ($trackInfo));

echo (json_encode ($response));
