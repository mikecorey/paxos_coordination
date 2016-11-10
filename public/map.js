var agentMarker = null;
var collectMarkers = [];
var mapLine = null;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: centerLatLong,
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  map.addListener('click', function (event) {
      console.log('clicked: ' + event.latLng);
      agent.flightplan.push({lat : event.latLng.lat(), lng : event.latLng.lng()});
      updateWaypoints();
  });

  agentMarker = new google.maps.Marker({
    position: null,
    label: '' + agent.id,
    icon: {path: google.maps.SymbolPath.CIRCLE,
           scale: 10
         }, 
    map: map
  });
  
  mapLine = new google.maps.Polyline({
    strokeColor: agent.color,
    path: agent.flightplan,
    //icons: tmpicons,
    map: map 
  });
}

function updateAgentLocation() {
  agentMarker.setPosition(agent.currentPos);
}

/*NOT SHOWING UP!!!*/
function updateCollects() {
  console.log('updating');
  collectMarkers = [];
  for (var i = 0; i < collects.length; i++) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng({lat: collects[i].lat, lng: collects[i].lng}),
      label: "C",
      map: map
    });
    console.log(marker.getPosition().toString());
    collectMarkers.push(marker);
    console.log('asd');
  }
}


function updateWaypoints() {
  mapLine.setPath(agent.flightplan);
}